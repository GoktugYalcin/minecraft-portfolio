import React from "react";

export const Crosshair = () => {
  return (
    <div className="absolute top-1/2 left-1/2 w-[20px] h-[20px] bg-transparent pointer-events-none transform-[translate(-50%, -50%)] flex justify-center items-center">
      <div className="absolute w-[2px] h-[20px] bg-white" />
      <div className="absolute h-[2px] w-[20px] bg-white" />
    </div>
  );
};
