import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList } from "react-native-gesture-handler";

const ViewPayment = () => {
  const router = useRouter();

  const itemrender = () => {
    return (
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
          <Text style={styles.text}>15 Mar 2025</Text>
          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              // marginTop: 16,
              color: "blue",
            }}
          >
            $30{" "}
            <MaterialCommunityIcons
              name="greater-than"
              size={16}
              color="#ddd"
            />
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen
        options={{
          title: "View Payments",
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
                  router.replace("/(drawer)/purchases");
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
          <FlatList
            data={[1, 2]}
            renderItem={itemrender}
            keyExtractor={(item) => item.toString()}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 20,
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ViewPayment;

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
