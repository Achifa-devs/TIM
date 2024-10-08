import { useRef, useState } from 'react';
import '../../globals.css'

import api from '../../services/api';

const Login = () => {

    let [btn, setBtn] = useState("Login")


    let [email, setEmail] = useState('')
    let [password, setPassword] = useState('')
    const validation = useRef(false); 


    let loginHandler = async(e) => {
        
        let check = document.querySelector('.err-cnt').querySelector('.err-mssg');

        if(check){
            document.querySelector('.err-cnt').querySelector('.err-mssg').remove()
        }

        Validation();
        if(validation.current){
            setBtn(
                <div className="Authloader" style={{background: '#fff'}}></div>
            )
            e.target.disabled = true;

            api.post('/login', {email,password})
            .then((response) => {
                setTimeout(() => {
                    window.location.href = '/'
                }, 100000000000000000000000000)

                console.log('...',response.data)
                if(response.data.bool){
                    window.localStorage.setItem('accessToken', response.data.access_token)
                    window.localStorage.setItem('refreshToken', response.data.refresh_token)
                    window.location.href = '/'
                }else{
                    let check = document.querySelector('.err-cnt').querySelector('.err-mssg');
                    if(check){
                        document.querySelector('.err-cnt').querySelector('.err-mssg').remove()
                        let div = document.createElement('div');
                        div.className = 'err-mssg';
                        div.style.display = 'table'
                        div.style.margin = '0 auto'
                        div.innerHTML = 'Invalid Credentials'
                        document.querySelector('.err-cnt').append(div)
                        
                    }else{
                        let div = document.createElement('div');
                        div.className = 'err-mssg';
                        div.style.display = 'table'
                        div.style.margin = '0 auto'
                        div.innerHTML = 'Invalid Credentials'
                        document.querySelector('.err-cnt').append(div)
                    }
                    e.target.disabled = false; 
                    setBtn("Login")
                }
    
            })
            .catch(err => {
                console.log(err)
            })
        }
    }

    function Validation() {

        let inputs = [...document.querySelectorAll('input')]

        let book = []

        function addErrMssg(err,pElem) {

            let check = pElem.querySelector('.err-mssg');
            if(check){
                pElem.querySelector('.err-mssg').remove()
                let div = document.createElement('div');
                div.className = 'err-mssg';
                console.log(err)
                if(err.length > 0 ){
                    div.innerHTML = err[0].mssg;
                    pElem.append(div)
                    validation.current=(false)

                }else{
                    validation.current=(true)
                    let check = pElem.querySelector('.err-mssg');

                    if(check){
                        pElem.querySelector('.err-mssg').remove()
                    }
                }
                
                
            }else{

                let div = document.createElement('div');
                div.className = 'err-mssg';
                console.log(err)

                if(err.length !== 0 ){
                    div.innerHTML = err[0].mssg;
                    pElem.append(div)
                    validation.current=(false)

                }else{
                    validation.current=(true)
                    let check = pElem.querySelector('.err-mssg');

                    if(check){
                        pElem.querySelector('.err-mssg').remove()
                    }
                }
            }
                
        }

        inputs.map(item => {
            if(item.type === 'text'){

                if(item.name === 'email'){

                    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    let empty = item.value !== '' ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please field cannot be empty.'}
                    let validEmail = emailRegex.test(item.value) ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please enter a valid email address.'}
                    let errs = [empty,validEmail];
                    console.log('empty',errs)
                    
                    addErrMssg(errs.filter(item => item.mssg !== ''),item.parentElement)

                }
                
            }else if(item.type === 'password'){
                let empty = item.value !== '' ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please field cannot be empty.'}
                let length = item.value.length >= 8 ? {bool: true, mssg: ''} :  {bool: false, mssg: 'Password must contain at least 8 characters.'}
                let errs = [empty,length];
                
                addErrMssg(errs.filter(item => item.mssg !== ''),item.parentElement)

            }
        })

      

    }

    return ( 
        <>

            <div className='form' action="" >



                <section className='last-child'>
                   
                </section>

                <section className='first-child'>
                    <h4 className="" style={{padding:'10px', margin: '0', height: 'auto', justifyContent: 'center', width: '100%', background: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center', color: 'blueviolet'}}>SignUp Form For Securiy</h4>

                    <small className='err-cnt'></small>
                    <div>
                        
                        <div className="input-cnt">
                            <input onInput={e => setEmail(e.target.value)} name='email' type="text" placeholder="Email" />
                        </div>
                        <div className="input-cnt">
                            <input onInput={e => setPassword(e.target.value)} type="password" placeholder="Password" />
                        </div>
                        
                        
                        <br />
                        <button onClick={e => {
                            e.preventDefault();
                            loginHandler(e)
                        }}>Submit</button>
                    </div>

                    <h6 className="" style={{padding:'10px', margin: '0', height: 'auto', justifyContent: 'center', width: '100%', background: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={e=> window.location.href="/signup"}>Don't Have An Account? Register Here.</h6>
                </section>
            </div>

        </>
     );
}
 
export default Login;