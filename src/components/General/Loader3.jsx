import React from "react";

export default function Loader3() {
  return (
    <div
      id="loader3"
      className=" z-50 absolute inset-0 bg-white/95 flex h-screen"
    >
      <div className="inline-block m-auto text-center">
        <img
          src="http://wplus.world/wplus-mn/img/success.png"
          className="inline-block"
        />
        <h3 className="font-bold mt-3 text-lg">Амжилттай</h3>
        <p className="text-xs mt-1">Таны купон код амжилттай идэвхжлээ.</p>
        <button className="bgBrand text-white font-light text-xs px-8 py-2 mt-3 rounded-full">
          Эхлэх
        </button>
      </div>
    </div>
  );
}
