import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Divider } from "react-native-paper";

export const MenuItem = ({
  onPress,
  title,
  open,
}: {
  onPress: () => void;
  title: string;
  open?: boolean;
}) => {
  return (
    <>
      <TouchableOpacity style={styles.drawerItem} onPress={onPress}>
        <MaterialCommunityIcons name="content-cut" size={24} />
        <Text style={[styles.drawerItemText, {
          fontWeight: "500",
        }]}>{title}</Text>

        <AntDesign
          name={open ? "caretdown" : "caretright"}
          size={12}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>

      <Divider
        style={{
          marginVertical: 10,
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  drawerItemText: {
    marginLeft: 16,
    fontSize: 16,
  },
  arrowIcon: {
    marginLeft: "auto",
  },
});
