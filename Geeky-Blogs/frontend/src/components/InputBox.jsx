import React, { useState } from "react";

function InputBox({ type, placeholder, id, name, icon, value, disable = false }) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="relative w-[100%] mb-4">
      <input
        type={type === "password" ? (passwordVisible ? "text" : "password") : type}
        name={name}
        placeholder={placeholder}
        id={id}
        disabled={disable}
        defaultValue={value}
        className="input-box"
        required
      />
      <i className={`fi fi-rr-${icon} input-icon`} />
      {type === "password" && (
        <i
          className={`fi fi-rr-${
            passwordVisible ? "eye" : "eye-crossed"
          } input-icon left-[auto] right-4 cursor-pointer`}
          onClick={() => setPasswordVisible((cur) => !cur)}
        />
      )}
    </div>
  );
}

export default InputBox;
