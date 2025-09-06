/* eslint-disable no-unused-vars */
import { useRef, useState } from "react";
import "../../globals.css";
import api from "../../services/api";
import Loader from "../../reusables/loader";
const Signup = () => {
  let [firstname, setFirstname] = useState("");
  let [lastname, setLastname] = useState("");
  let [email, setEmail] = useState("");
  let [phone, setPhone] = useState("");
  let [password, setpassword] = useState("");
  let [role, setRole] = useState('user');
  let [photo, setphoto] = useState();
  let [photo_validate, setphoto_validate] = useState();

  const validation = useRef(false);
  let [btn, setBtn] = useState("Signup");

  let book = useRef({
    firstname: false,
    lastname: false,
    email: false,
    password: false,
    phone: false,
  });

  function addErrMssg(err, pElem) {
    let check = pElem.querySelector(".err-mssg");
    if (check) {
      pElem.querySelector(".err-mssg").remove();
      let div = document.createElement("div");
      div.className = "err-mssg";
      // console.log(err)
      if (err.length > 0) {
        div.innerHTML = err[0].mssg;
        pElem.append(div);
      } else {
        let check = pElem.querySelector(".err-mssg");

        if (check) {
          pElem.querySelector(".err-mssg").remove();
        }
      }
    } else {
      let div = document.createElement("div");
      div.className = "err-mssg";
      // console.log(err)

      if (err.length !== 0) {
        div.innerHTML = err[0].mssg;
        pElem.append(div);
      } else {
        let check = pElem.querySelector(".err-mssg");

        if (check) {
          pElem.querySelector(".err-mssg").remove();
        }
      }
    }
  }

  let Registration = async (e) => {
    // e.currentTarget.disabled = true;
    // let overlay = document.querySelector('.overlay')

    Validation();
    Object.values(book.current).filter((item) => item !== true).length > 0
      ? (validation.current = false)
      : (validation.current = true);

    if (validation.current) {
      loaderSwitch()

      try {
        api
          .post("https://api.sinmfuoyeplatform.com.ng/api/v1/auth/signup", { firstname, lastname, email, phone, password, role })
          .then((response) => {
            console.log("...", response);
            loaderSwitch()

            if (response.data.success) {
              // window.localStorage.setItem('accessToken', response.data.access_token)
              // After Signup, redirect to login page
              window.location.href = "/login";
            } else {
              alert('internal server error')
            }
          })
          .catch((err) => {
            loaderSwitch()

            console.log(err.response.data);
            if (err.response.data.detail) {
              alert(err.response.data.detail[0].msg)
            } else {
              alert(err.response.data.error)
            }

          });
      } catch (err) {
        // let overlay = document.querySelector('.overlay')
        // overlay.removeAttribute('id');
        if (err.response.data === "duplicate email") {
          addErrMssg(
            [{ mssg: "Email already exist, please try something else" }],
            document.querySelector(".email").parentElement
          );
        } else if (err.response.data === "duplicate phone") {
          addErrMssg(
            [{ mssg: "Phone Number already exist, please try something else" }],
            document.querySelector(".phone").parentElement
          );
        }
        setBtn("Signup");
        // console.log(err)
        e.currentTarget.disabled = false;
      }
    } else {
      console.log(validation.current);

      setBtn("Signup");
      e.currentTarget.disabled = false;
    }
  };

  function Validation() {
    let inputs = [...document.querySelectorAll("input")];

    inputs.map(async (item) => {
      if (item.type === "text") {
        if (item.name === "firstname") {
          let empty =
            item.value !== "" ? { bool: true, mssg: "" } : { bool: false, mssg: "Please field cannot be empty" };
          let length =
            item.value.length > 3
              ? { bool: true, mssg: "" }
              : { bool: false, mssg: "Please name must be at least 3 letters." };
          let specialCharFree = /^[a-zA-Z]+$/.test(item.value.trim())
            ? { bool: true, mssg: "" }
            : { bool: false, mssg: "Please enter only alphabets." };
          let errs = [empty, length, specialCharFree];

          addErrMssg(
            errs.filter((item) => item.mssg !== ""),
            item.parentElement
          );
          let list = errs.filter((item) => item.mssg !== "");

          list.length > 0 ? (book.current.firstname = false) : (book.current.firstname = true);
        } else if (item.name === "lastname") {
          let empty =
            item.value !== "" ? { bool: true, mssg: "" } : { bool: false, mssg: "Please field cannot be empty" };
          let length =
            item.value.length > 3
              ? { bool: true, mssg: "" }
              : { bool: false, mssg: "Please name must be at least 3 letters." };
          let specialCharFree = /^[a-zA-Z]+$/.test(item.value.trim())
            ? { bool: true, mssg: "" }
            : { bool: false, mssg: "Please enter only alphabets." };

          let errs = [empty, length, specialCharFree];

          addErrMssg(
            errs.filter((item) => item.mssg !== ""),
            item.parentElement
          );
          let list = errs.filter((item) => item.mssg !== "");

          list.length > 0 ? (book.current.lastname = false) : (book.current.lastname = true);
        } else if (item.name === "email") {
          // let emailvailidity = await checkEmailDuplicate();
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          let empty =
            item.value !== "" ? { bool: true, mssg: "" } : { bool: false, mssg: "Please field cannot be empty." };
          let validEmail = emailRegex.test(item.value)
            ? { bool: true, mssg: "" }
            : { bool: false, mssg: "Please enter a valid email address." };
          // let emailDuplicate =  emailvailidity ? {bool: true, mssg: ''} : {bool: false, mssg: 'Email already exist, please try something else'}
          let errs = [empty, validEmail];
          addErrMssg(
            errs.filter((item) => item.mssg !== ""),
            item.parentElement
          );
          let list = errs.filter((item) => item.mssg !== "");
          list.length > 0 ? (book.current.email = false) : (book.current.email = true);
        }
      } else if (item.type === "password") {
        if (item.name === "password") {
          let empty =
            item.value !== "" ? { bool: true, mssg: "" } : { bool: false, mssg: "Please field cannot be empty." };
          let length =
            item.value.length >= 8
              ? { bool: true, mssg: "" }
              : { bool: false, mssg: "Password must contain at least 8 characters." };
          let errs = [empty, length];

          addErrMssg(
            errs.filter((item) => item.mssg !== ""),
            item.parentElement
          );

          let list = errs.filter((item) => item.mssg !== "");

          list.length > 0 ? (book.current.password = false) : (book.current.password = true);
        }
      } else if (item.type === "tel") {
        if (item.name === "phone") {
          let empty =
            item.value !== "" ? { bool: true, mssg: "" } : { bool: false, mssg: "Please field cannot be empty." };
          let length =
            item.value.length >= 11 ? { bool: true, mssg: "" } : { bool: false, mssg: "Invalid Phone Number" };
          let errs = [empty, length];

          addErrMssg(
            errs.filter((item) => item.mssg !== ""),
            item.parentElement
          );

          let list = errs.filter((item) => item.mssg !== "");

          list.length > 0 ? (book.current.phone = false) : (book.current.phone = true);
        }
      }
    });
  }

  function loaderSwitch(params) {
    let elem = document.querySelector('.loader-overlay');
    if(elem.hasAttribute('id')){
      elem.removeAttribute('id')
    }else{
      elem.setAttribute('id', 'loader-overlay')
    }
  }

  return (
    <>
      <Loader />
      <div className="form" action="">
        <section className="last-child"></section>

        <section className="first-child">
          <h4
            className=""
            style={{
              padding: "10px",
              margin: "0",
              height: "auto",
              justifyContent: "center",
              width: "100%",
              background: "#fff",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              color: "blueviolet",
            }}
          >
            SignUp Form For Securiy
          </h4>

          

          <div>
            <div className="input-cnt">
              <input name="firstname" onInput={(e) => setFirstname(e.target.value)} type="text" placeholder="FirstName" />
            </div>
            <div className="input-cnt">
              <input name="lastname" onInput={(e) => setLastname(e.target.value)} type="text" placeholder="LastName" />
            </div>
            <div className="input-cnt">
              <input
                name="email"
                className="email"
                onInput={(e) => setEmail(e.target.value)}
                type="text"
                placeholder="Email"
              />
            </div>
            <div className="input-cnt">
              <input
                name="phone"
                className="phone"
                minLength={11}
                maxLength={11}
                onInput={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="Phone Number"
              />
            </div>

            <div className="input-cnt">
              <input
                name="password"
                onInput={(e) => setpassword(e.target.value)}
                type="password"
                placeholder="Password"
              />
            </div>

            <br />
            {/* <h6><u>Upload a cover photo</u></h6>

                        <input id="file" style={{display: 'none'}} onChange={handleImage} name="file" type="file" />
                        <div className="img-frame">
                            <div className="img-cnt-h">
                                <label id="active" className="label" htmlFor="file">
                                    <img src={upload_svg} style={{height: '25px', width: '25px', }} alt="" />
                                    
                                </label>
                                <div className="remove" style={{height: '20px', width: '20px', }} onClick={handleRemove}>
                                    x
                                </div> 
                            </div>

                            

                            <div className="img-info">
                                <ul>
                                    <li><u>Image Must Be Below 16 MB</u></li>
                                    <li>Image Size: Awaiting Upload</li>
                                    <li>Image Name: Awaiting Upload</li>
                                </ul>
                            </div>
                        </div>
                        <br />
                        <div className="mssg" id="img-err"></div> */}

            <br />
            <button onClick={Registration}>Submit</button>
          </div>

          <h6
            className=""
            style={{
              padding: "10px",
              margin: "0",
              height: "auto",
              justifyContent: "center",
              width: "100%",
              background: "#fff",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={(e) => (window.location.href = "/login")}
          >
            Already Registered? Login Here.
          </h6>
        </section>
      </div>
    </>
  );
};

export default Signup;
