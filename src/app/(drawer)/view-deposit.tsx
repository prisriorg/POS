import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useState } from "react";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList } from "react-native-gesture-handler";
import { useAppSelector } from "@/src/store/reduxHook";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { BASE_URL } from "@/src/utils/config";

const ViewDeposit = () => {
  const router = useRouter();
  const { user, domain } = useAppSelector((st) => st.auth);
  const prms = useLocalSearchParams();
  const [getlists, setLists] = useState([]);

  const visualFeedback = useVisualFeedback();
  const getData = async (id: string) => {
    try {
      visualFeedback.showLoadingBackdrop();

      const response = await fetch(
        `${BASE_URL}deposits/${id}?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.status === 200) {
        setLists(data.deposits);
      } else {
        // Handle error
        console.error("Error fetching purchase details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (prms?.id) {
        getData(prms?.id as string);
      }
      return () => {
        // Any cleanup code here
      };
    }, [prms?.id, user?.id, domain])
  );

  const itemrender = ({ item }: any) => {
    return (
      <Pressable
        onPress={() => {
          router.push(`/(drawer)/edit-deposit?id=${item.id}`);
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            paddingBottom: 10,
            paddingTop: 15,
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.text}>Date</Text>
            <Text style={styles.text}>Amount</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.text}>
              {new Date(item.date).toDateString()}
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 8,
                // marginTop: 16,
                color: "blue",
              }}
            >
              {item.amount}{" "}
              <MaterialCommunityIcons
                name="greater-than"
                size={16}
                color="#ddd"
              />
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen
        options={{
          title: "View Deposit",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#fff",
          },

          headerTitleStyle: {
            color: Colors.colors.text,
          },
          headerLeft(props) {
            return (
              <Pressable
                onPress={() => {
                  router.replace("/(drawer)/customers");
                }}
                style={{
                  padding: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: Colors.colors.primary,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="arrow-back-outline" size={24} color="white" />
                </View>
              </Pressable>
            );
          },
        }}
      />

      <ScrollView>
        <View style={{ margin: 20 }}>
          {getlists.length > 0 ? (
            <FlatList
              data={getlists}
              renderItem={itemrender}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 20,
              }}
            />
          ) : (
            <>
              <Text
                style={{
                  textAlign: "center",
                  flex: 1,
                }}
              >
                No deposits
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ViewDeposit;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "#ccc",
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    // marginTop: 16,
    color: Colors.colors.text,
  },
});
