import * as Yup from 'yup';
export const passwordValidation =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\\])[A-Za-z\d !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\\]{8,}$/;
export const phoneValidation = /^(?<!\d)\d{10}(?!\d)$/;
export const emailValidation = /^[^.][A-za-z0-9.]+@[a-z]+\.[a-z]{2,3}$/;
export const signInFormValidation = Yup.object().shape({
  email: Yup.string()
    // .email('Please enter a valid email')
    // .matches(emailValidation, 'Please enter a valid email')
    .required('The username is required'),
  password: Yup.string().required('The password is required'),
  domain: Yup.string().required('The domain is required'),
});
export const signUp1 = Yup.object().shape({
  companyName: Yup.string()
    .min(3, 'The company name should be at least 3 characters')
    .max(25, 'The company name should be maximum 25 characters')
    .required('The company name is required'),
});
