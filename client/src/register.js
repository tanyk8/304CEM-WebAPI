import React, { useState,useEffect } from 'react';
import {useNavigate} from 'react-router-dom'
import jwt_decode from 'jwt-decode'
import './register.css';
import ProgressBar from 'react-bootstrap/ProgressBar';
import validator from 'validator'

function Register(){
    const navigate=useNavigate()

    const [username,setUsername]= useState('')
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')

    const [usernamevalid,setUsernameValid]=useState('')
    const [emailvalid,setEmailValid]=useState('')
    const [passwordvalid,setPasswordValid]=useState('')

    const [progress,setProgress]=useState('')

    //useeffect to check whether user is logged in, if so then redirect to api page 
    useEffect(()=>{
    const token=localStorage.getItem('token')
    if(token){
        const user=jwt_decode(token)
        if(user){
        navigate("/api", { replace: true });
        }
    }
    else{
        
    }
    })

    //used for validating username and email
    function validateField(e){
        const name = e.target.name;
        const value = e.target.value;
        if(name==="username"){
            if(value===""){
                //error
                setUsernameValid(false)
            }
            else if(!value.match(/^[a-zA-Z0-9]*$/)){
                setUsernameValid(false)
            }
            else{
                setUsername(value)
                setUsernameValid(true)
            }
        }
        else if(name==="email"){
            if(value===""){
                setEmailValid(false)
            }
            else if(!validator.isEmail(value)){
                setEmailValid(false)
            }
            else{
                setEmail(value)
                setEmailValid(true)
            }
        }
    }

    //if the info is valid, add user to database and redirect back to login
    async function registerUser(e){
        e.preventDefault();

        console.log(username+"|"+usernamevalid)
        console.log(email+"|"+emailvalid)
        console.log(password+"|"+passwordvalid)
        var msg=""
        if(usernamevalid===false){
            msg+="Invalid username\n"
        }
        else if(emailvalid===false){
            msg+="Invalid email\n"
        }
        else if(passwordvalid===false){
            msg+="Invalid password\n"
        }
        
        if(msg!==""){
            alert(msg)
        }
        else{
            const response= await fetch('http://localhost:5000/api/register',{
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            })

            const data=await response.json();
            if(data.status==='ok'){
                alert('Registered successfully')
                navigate("/login", { replace: true });
            }
            else if(data.status==='error'){
                alert('Email is in use!')
            }
        }
    }

    //function to check password strength and updating progress bar and criteria
    function passProgress(e){
        var password = e.target.value;
        var percent=0;
        var part=[0,0,0,0,0];
        
        if(password.length>7){
            part[0]=20;
            document.getElementById("plength").innerHTML="&#10004;";
            document.getElementById("plength").style.color = "green";
        }
        else{
            part[0]=0;
            document.getElementById("plength").innerHTML="&#10006;";
            document.getElementById("plength").style.color = "red";
        }
        
        if(password.match(/[a-z]/)){
            part[1]=20;
            document.getElementById("psmalla").innerHTML="&#10004;";
            document.getElementById("psmalla").style.color = "green";
        }
        else{
            part[1]=0;
            document.getElementById("psmalla").innerHTML="&#10006;";
            document.getElementById("psmalla").style.color = "red";
        }
        
        if(password.match(/[A-Z]/)){
            part[2]=20;
            document.getElementById("pbiga").innerHTML="&#10004;";
            document.getElementById("pbiga").style.color = "green";
        }
        else{
            part[2]=0;
            document.getElementById("pbiga").innerHTML="&#10006;";
            document.getElementById("pbiga").style.color = "red";
        }
        
        if(password.match(/[0-9]/)){
            part[3]=20;
            document.getElementById("pnum").innerHTML="&#10004;";
            document.getElementById("pnum").style.color = "green";
        }
        else{
            part[3]=0;
            document.getElementById("pnum").innerHTML="&#10006;";
            document.getElementById("pnum").style.color = "red";
        }
        
        if(password.match(/[@#$!%&]/)){
            part[4]=20;
            document.getElementById("psym").innerHTML="&#10004;";
            document.getElementById("psym").style.color = "green";
        }
        else{
            part[4]=0;
            document.getElementById("psym").innerHTML="&#10006;";
            document.getElementById("psym").style.color = "red";
        }
        
        for (var i = 0; i < 5; i++) {
          percent += part[i];
        }
        
        setProgress(percent)
        
        if(percent<60){
            document.getElementById("passStrength").innerHTML="Weak";
            setPasswordValid(false)
        }
        else if(percent<100){
            document.getElementById("passStrength").innerHTML="Medium";
            setPasswordValid(false)
        }
        else{
            document.getElementById("passStrength").innerHTML="Strong";
            setPasswordValid(true)
            setPassword(e.target.value)
        }
    }

    //button function to redirect user to login
    function redirectToLogin(e){
        navigate("/login", { replace: true });
    }

    //html content
    return(
        <div className="registerform App-header">
            <h1>Register</h1>
            <form onSubmit={registerUser}>
                <input 
                    name="username"
                    type="text" 
                    placeholder="Username"
                    onChange={validateField}
                    required
                />
                <br/>
                <input 
                    name="email"
                    type="email" 
                    placeholder="Email"
                    onChange={validateField}
                    required
                />
                <br/>
                
                <div className='passtooltip'>
                    <input type='password'  placeholder='Enter password' className='selectpass' name='password' id='password' onChange={passProgress} maxLength='20' required/>
                    <span className='passstr'>
                        <p id='passStrength'>Weak</p>
                        <ProgressBar now={progress} />	
                        <div id='plength'>&#10006;</div> Password length more than 7<br/>
                        <div id='psmalla'>&#10006;</div> Include smallcase alphabet<br/>
                        <div id='pbiga'>&#10006;</div> Include uppercase alphabet<br/>
                        <div id='pnum'>&#10006;</div> Include numbers<br/>
                        <div id='psym'>&#10006;</div> Include symbols
                    </span>
                </div>
                <br/>
                <input type="submit" value="Register" className='generalbtn'/><br/>
                <button onClick={redirectToLogin} className='generalbtn'>Back</button>
            </form>
        </div>
    )
}

export default Register;