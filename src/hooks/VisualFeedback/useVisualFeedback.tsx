import {useContext} from 'react';
import VisualFeedbackContext, {
  IVisualFeedbackContext,
} from './VisualFeedbackContext';

const useVisualFeedback = (): IVisualFeedbackContext =>
  useContext(VisualFeedbackContext);

export default useVisualFeedback;
