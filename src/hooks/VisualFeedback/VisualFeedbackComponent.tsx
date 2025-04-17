import React, {ReactNode, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, View, Text} from 'react-native';
import VisualFeedbackContext, {
  IVisualFeedbackContext,
} from './VisualFeedbackContext';

interface VisualFeedbackComponentProps {
  children: ReactNode;
}

const VisualFeedbackComponent = ({children}: VisualFeedbackComponentProps) => {
  const [backdropState, setBackdropState] = useState<{
    shown: boolean;
    message?: string;
  }>({shown: false});

  function showLoadingBackdrop(message?: string): void {
    setBackdropState({shown: true, message: message?.trim()});
  }

  function hideLoadingBackdrop(): void {
    setBackdropState({shown: false, message: undefined});
  }

  function showDialog(params: {
    title?: string;
    message: string;
    onOKClick?: () => void;
  }): void {
    Alert.alert(
      params.title ?? 'Attention',
      params.message,
      [
        {
          text: 'OK',
          onPress: () => {
            if (params.onOKClick != null) {
              params.onOKClick();
            }
          },
        },
      ],
      {cancelable: false},
    );
  }

  const visualFeedbackContextValue: IVisualFeedbackContext = {
    showLoadingBackdrop,
    hideLoadingBackdrop,
    showDialog,
  };

  return (
    <VisualFeedbackContext.Provider value={visualFeedbackContextValue}>
      {children}

      {backdropState.shown && (
        <View style={styles.backdrop}>
          <View style={styles.backdropContentContainer}>
            <ActivityIndicator size="large" color="black" />
            {backdropState.message != null && !backdropState.message && (
              <>
                <View style={{width: 20}} />
                <Text>{backdropState.message}</Text>
              </>
            )}
          </View>
        </View>
      )}
    </VisualFeedbackContext.Provider>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
  },
});

export default VisualFeedbackComponent;
