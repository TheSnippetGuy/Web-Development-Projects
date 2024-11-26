import React from "react";

function NoData({ message }) {
  return (
    <div>
      <p className="text-center w-full p-4 rounded-full bg-grey/50 mt-4">{message}</p>
    </div>
  );
}

export default NoData;
