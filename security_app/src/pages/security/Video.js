import React from "react";
import Body from "../../components/Security/Video/Body";
import Summary from "../../components/Security/Video/Summary";
import "../../components/Security/Video/styles/xxl.css";
import SecurityLayout from "../../layouts/security";
import Loader from "../../reusables/loader";

export default function Video() {
  return (
    <>
      <SecurityLayout>
        <Loader />
        <div className="video-upload">
          <Summary />
          <Body />
        </div>
      </SecurityLayout>
    </>
  );
}
