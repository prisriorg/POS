/* eslint-disable no-unused-vars */
import React from 'react';

export interface IVisualFeedbackContext {
  showLoadingBackdrop: (message?: string) => void;
  hideLoadingBackdrop: () => void;
  showDialog: (params: {
    title?: string;
    message: string;
    onOKClick?: () => void;
  }) => void;
}

const VisualFeedbackContext =
  // @ts-ignore
  React.createContext<IVisualFeedbackContext>();

export default VisualFeedbackContext;
