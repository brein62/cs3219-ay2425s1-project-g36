import { useState } from "react";
import InputFieldWithTip from "./InputFieldWithTip";
import SignupButton from "./SignupButton";
import { DisplayedMessage, DisplayedMessageContainer, DisplayedMessageTypes } from "@/components/common/DisplayedMessage";
import { sendSignupRequest } from "@/api/user-service/UserService";

export default function LoginForm(){

    const [username, setUsername] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [displayedSignupMessage, setDisplayedSignupMessage] = useState<DisplayedMessage | null>(null);

    const tip_username = "Your username should only contains A-Z, a-z, 0-9 and underscores, and it should be unique among all users.";
    const tip_email = "You can only signup one account per email address."
    const tip_password = "Your can use A-Z, a-z and 0-9 to form your password. Your password should be at least 8 characters long, and should contains at least one upper case letter, one lower case letter and one digit.";
    const tip_confirmpassword = "Please repeat your password.";

    const isUsernameValid= () => {
        return /^[0-9A-Za-z_]*$/.test(username);
    }

    const isEmailAddressValid = () => {
        return /^[0-9A-Za-z._]+@[0-9A-Za-z._]+\.[A-Za-z]+$/.test(emailAddress);
    }

    const isPasswordValid = () => {
        return password.length >= 8 && /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[0-9A-Za-z]*$/.test(password);
    }

    const passwordInputFieldOnChangeHandler = (newPassword : string) => {
        setPassword(newPassword);
        let passwordStrengthSum = 0;
        passwordStrengthSum += newPassword.length * 4; // longer password is considered safer
        if(newPassword.length > 1) {
            // 0=number 1=upper case, 2=lower case
            const getCharacterType = (index : number) => {
                const charCode = newPassword.charCodeAt(index);
                if(charCode >= 48 && charCode <= 57) { // 0-9
                    return 0;
                }
                if(charCode >= 65 && charCode <= 90) { // A-Z
                    return 1;
                }
                if(charCode >= 97 && charCode <= 122) { // a-z
                    return 2;
                }
                return 0;
            }
            for(let i = 1; i < newPassword.length; i++){
                passwordStrengthSum += getCharacterType(i) !== getCharacterType(i - 1) ? 10 : 0; // password with different character type between more adjancent characters is considered safer
            }
        }
        setPasswordStrength(passwordStrengthSum);
    }

    const showDisplayedSignupMessage = (message : string, type : DisplayedMessageTypes) => {
        setDisplayedSignupMessage({message : message, type : type});
    }

    const startSigningUp = () => {
        if(username==="" || emailAddress === "" || password === "" || confirmPassword === "") {
            showDisplayedSignupMessage("All fields cannot be empty.", DisplayedMessageTypes.Error);
            return;
        }
        if(!isUsernameValid()){
            showDisplayedSignupMessage("Invalid username.", DisplayedMessageTypes.Error);
            return;
        }
        if(!isEmailAddressValid()){
            showDisplayedSignupMessage("Invalid email address.", DisplayedMessageTypes.Error);
            return;
        }
        if(!isPasswordValid()){
            showDisplayedSignupMessage("Invalid password.", DisplayedMessageTypes.Error);
            return;
        }
        if(confirmPassword !== password){
            showDisplayedSignupMessage("Password and confirm password does not match each other.", DisplayedMessageTypes.Error);
            return;
        }
        showDisplayedSignupMessage("Signing up...", DisplayedMessageTypes.Info);
        sendSignupRequest(username, emailAddress, password, "") // TODO: captcha logic (after captcha logic is implemented in the backend)
        .then(response => {
            const message = response.message;
            const isSuccess = response.status === 200;
            const type = isSuccess ? DisplayedMessageTypes.Info : DisplayedMessageTypes.Error;
            showDisplayedSignupMessage(message, type);
            if(isSuccess) {
              // TODO: Show email verification page, or go back to login page, or...? Will implement here after signup login is implemented in the backend.
            }
          });
    }

    return(
        <>
          <form onSubmit={evt => {evt.preventDefault(); startSigningUp();}} className="w-3/4">
            <p className="font-bold mb-1">Username:</p>
            <InputFieldWithTip placeholder="Your username" onChange={setUsername} type="text">
              {!isUsernameValid() && (<div className="text-red-300">Invalid username.</div>)}
              {tip_username}
            </InputFieldWithTip>
            <p className="font-bold mt-3 mb-1">Email Address:</p>
            <InputFieldWithTip placeholder="Your email" onChange={setEmailAddress} type="text">
              {!isEmailAddressValid() && (<div className="text-red-300">Invalid email address.</div>)}
              {tip_email}
            </InputFieldWithTip>
            <p className="font-bold mt-3 mb-1">Password:</p>
            <InputFieldWithTip placeholder="Your password" onChange={passwordInputFieldOnChangeHandler} type="password">
             {!isPasswordValid() && (<div className="text-red-300">Invalid password.</div>)}
              <p>Password strength:</p>
              <div className="h-3 flex flex-row bg-gray-300">
                {passwordStrength > 0 && (<div className="bg-red-500" style={{width: Math.min(passwordStrength, 33) + "%"}}/>)}
                {passwordStrength > 33 && <div className="bg-yellow-500" style={{width: (Math.min(passwordStrength, 67) - 33) + "%"}}/>}
                {passwordStrength > 66 && <div className="bg-green-500" style={{width: (Math.min(passwordStrength, 100) - 66) + "%"}}/>}
              </div>
              <div className="m-2"/>
              {tip_password}
            </InputFieldWithTip>
            <p className="font-bold mt-3 mb-1">Confirm Password:</p>
            <InputFieldWithTip placeholder="Confirm Password" onChange={setConfirmPassword} type="password">
              {confirmPassword !== password && (<div className="text-red-300">Password does not match.</div>)}
              {tip_confirmpassword}
            </InputFieldWithTip>
            <DisplayedMessageContainer displayedMessage={displayedSignupMessage}/>
            <SignupButton onClick={startSigningUp}/>
          </form>
        </>
    )
}