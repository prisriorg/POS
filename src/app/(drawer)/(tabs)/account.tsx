import { Colors } from "@/src/constants/Colors";
import { setDomain, setUser } from "@/src/store/reducers/authReducer";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";
import { Spacer10 } from "@/src/utils/Spacing";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Image,
  Platform,
  View,
  Text,
  Pressable,
} from "react-native";

export default function TabTwoScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          padding: 20,
          margin: 10,
          borderRadius: 10,
          backgroundColor: Colors.colors.primary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FontAwesome6
          name="circle-user"
          size={100}
          color={"#fff"}
          style={{ marginRight: 10 }}
        />
        <Spacer10 />
        <Text
          style={{
            fontSize: 20,
            color: "#fff",
            marginBottom: 8,
          }}
        >
          {user?.name|| ""}
        </Text>
        <Text
          style={{
            fontSize: 20,
            color: "#fff",
            marginBottom: 10,
          }}
        >
          {user?.email || ""}
        </Text>
      </View>
      <Pressable
        onPress={() => {
          dispatch(setUser(null));

          dispatch(setDomain(""));
          router.replace("/auth");
        }}
      >
        <View
          style={{
            marginTop: 20,
            marginHorizontal: 10,
            padding: 15,
            borderRadius: 10,
            backgroundColor: "#fff",
            flexDirection: "row",
            gap: 10,
            alignItems: "flex-start",
            borderBottomColor: "#808080",
            borderBottomWidth: 1,
          }}
        >
          <Feather name="log-out" size={24} color="black" />
          <Text
            style={{
              fontSize: 18,
              color: "#000",
            }}
          >
            Logout
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
