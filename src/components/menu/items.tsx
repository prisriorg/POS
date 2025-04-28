import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { Divider } from "react-native-paper";

export const MenuItem = ({
  onPress,
  title,
  open,
  icon = <MaterialCommunityIcons name="content-cut" size={24} />,
  lastIcon = false,
}: {
  onPress: () => void;
  title: string;
  open?: boolean;
  icon?: React.ReactNode;
  lastIcon?: boolean;
}) => {
  return (
    <>
      <TouchableOpacity style={styles.drawerItem} onPress={onPress}>
        {icon}
        <Text
          style={[
            styles.drawerItemText,
            {
              fontWeight: "500",
            },
          ]}
        >
          {title}
        </Text>
        {lastIcon && (
          <Entypo
            name={open ? "chevron-down" : "chevron-right"}
            size={20}
            style={styles.arrowIcon}
          />
        )}
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
    paddingEnd: 8,
    paddingStart: 8,
  },
  drawerItemText: {
    marginLeft: 16,
    fontSize: 16,
  },
  arrowIcon: {
    marginLeft: "auto",
  },
});
