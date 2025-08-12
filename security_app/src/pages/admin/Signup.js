/* eslint-disable no-unused-vars */
import { useRef, useState } from "react";
import "../../globals.css";
import api from "../../services/api";
const Signup = () => {
  let [fname, setFname] = useState("");
  let [lname, setLname] = useState("");
  let [email, setEmail] = useState("");
  let [phone, setPhone] = useState("");
  let [password, setpassword] = useState("");
  let [photo, setphoto] = useState();
  let [photo_validate, setphoto_validate] = useState();

  const validation = useRef(false);
  let [btn, setBtn] = useState("Signup");

  let book = useRef({
    fname: false,
    lname: false,
    email: false,
    password: false,
    phn: false,
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
      // overlay.setAttribute('id', 'overlay');
      setBtn(<div className="Authloader" style={{ background: "#fff", border: "1px solid orangered" }}></div>);
      // e.currentTarget.disabled = true;
      try {
        api
          .post("/admin/registration", { fname, lname, email, phone, password })
          .then((response) => {
            // console.log('...',response)
            if (response.data.bool) {
              window.localStorage.setItem("accessToken", response.data.access_token);

              window.location.href = "/admin/";
            } else {
              if (response.data.data === "duplicate email") {
                console.log(response.data);

                addErrMssg(
                  [{ mssg: "Email already exist, please try something else" }],
                  document.querySelector(".email").parentElement
                );
              } else if (response.data === "duplicate phone") {
                addErrMssg(
                  [{ mssg: "Phone Number already exist, please try something else" }],
                  document.querySelector(".phone").parentElement
                );
              }
              setBtn("Signup");
              e.target.disabled = false;
            }
          })
          .catch((err) => {
            console.log(err);
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
        if (item.name === "fname") {
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

          list.length > 0 ? (book.current.fname = false) : (book.current.fname = true);
        } else if (item.name === "lname") {
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

          list.length > 0 ? (book.current.lname = false) : (book.current.lname = true);
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

          list.length > 0 ? (book.current.phn = false) : (book.current.phn = true);
        }
      }
    });
  }

  let handleRemove = (e) => {
    let img_holder = document.querySelector(".img-cnt");
    img_holder.querySelector("img").remove();

    let label = document.querySelector(".label");
    let remove = document.querySelector(".remove");

    label.removeAttribute("id");
    remove.removeAttribute("id");

    let img_info = document.querySelector(".img-info");
    let info_size = img_info.children[0].children[1];
    let info_name = img_info.children[0].children[2];

    info_name.innerHTML = `File Name: Awaiting Upload`;
    info_size.innerHTML = `File Size: Awaiting Upload`;
    setphoto_validate(false);
    document.querySelector("#file").value = "";
  };

  let handleImage = () => {
    let f = document.querySelector("#file");

    let reader = new FileReader();

    reader.onload = (result) => {
      //document.querySelector(".img-cnt").querySelector('label').style.display = 'none';

      let label = document.querySelector(".label");
      let remove = document.querySelector(".remove");

      label.setAttribute("id", "inactive");
      remove.setAttribute("id", "active");

      let name = [...f.files][0].name;
      let size = [...f.files][0].size;

      let img_info = document.querySelector(".img-info");
      let info_size = img_info.children[0].children[1];
      let info_name = img_info.children[0].children[2];

      info_name.innerHTML = `File Name: ${name}`;
      info_size.innerHTML = `File Size: ${(size / 1024 ** 2).toFixed(2)}MB`;

      setphoto(reader.result);
      setphoto_validate(true);

      let img = `<img src=${reader.result} style='height: 100%; width: 100%; margin: 20px 0 20px 0' alt='' />`;
      document.querySelector(".img-cnt-h").insertAdjacentHTML("afterbegin", img);
    };
    reader.readAsDataURL([...f.files][0]);
  };

  return (
    <>
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
              <input name="fname" onInput={(e) => setFname(e.target.value)} type="text" placeholder="FirstName" />
            </div>
            <div className="input-cnt">
              <input name="lname" onInput={(e) => setLname(e.target.value)} type="text" placeholder="LastName" />
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
            onClick={(e) => (window.location.href = "/admin/login")}
          >
            Already Registered? Login Here.
          </h6>
        </section>
      </div>
    </>
  );
};

export default Signup;
