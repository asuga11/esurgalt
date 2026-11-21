import React from "react";

export default function Loader2() {
  return (
    <div
      id="loader2"
      className=" z-50 absolute inset-0 bg-white/95 flex h-screen"
    >
      <div className="inline-block m-auto text-center">
        <img
          src="http://wplus.world/wplus-mn/img/mail.png"
          className="inline-block"
        />
        <h3 className="font-bold mt-3 text-lg">Амжилттай</h3>
        <p className="text-xs mt-1">
          Бүртгэл баталгаажуулах холбоосыг
          <br />
          таны и-мэйлрүү илгээлээ.
          <br />
          Та бүртгэлээ баталгаажуулна уу
        </p>
        <button className="bgBrand text-white font-light text-xs px-8 py-2 mt-3 rounded-full">
          Хаах
        </button>
      </div>
    </div>
  );
}
