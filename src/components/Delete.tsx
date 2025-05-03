import * as React from 'react';
import {View} from 'react-native';
import {Portal, Dialog, Paragraph, Button} from 'react-native-paper';
import {Colors} from '../constants/Colors';

const DeleteProductDialog = ({visible, onDismiss, onDelete}) => {
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{
          backgroundColor: '#fff',
          borderRadius: 10,
        }}>
        <Dialog.Content>
          <Paragraph
            style={{
              textAlign: 'center',
            }}>
            Product will be deleted and cannot be retrieved later. Are you sure
            you want to delete this product?
          </Paragraph>
        </Dialog.Content>
        <View
          style={{
            flexDirection: 'row',
            // justifyContent: 'center',

            paddingHorizontal: 16,
            paddingBottom: 16,
          }}>
          <Button
            onPress={onDismiss}
            mode="contained"
            buttonColor={Colors.colors.background}
            style={{flex: 1, marginRight: 8}}
            textColor="gray">
            Cancel
          </Button>
          <Button
            onPress={onDelete}
            mode="contained"
            buttonColor={Colors.colors.primary}
            style={{flex: 1, marginLeft: 8}}
            textColor="#fff">
            Delete
          </Button>
        </View>
      </Dialog>
    </Portal>
  );
};

export default DeleteProductDialog;
