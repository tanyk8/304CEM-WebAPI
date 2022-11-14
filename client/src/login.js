import React, { useState,useEffect } from 'react';
import {useNavigate} from 'react-router-dom'
import jwt_decode from 'jwt-decode'
import './login.css';

function Login(){
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')

    const navigate=useNavigate()

    //use effect to check for available token, if user is logged in then redirect to api page
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

      //function to check login credentials and set authentication token
    async function loginUser(e){
        e.preventDefault();
        const response= await fetch('http://localhost:5000/api/login',{
            method:"POST",
            headers:{
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        })

        const data=await response.json();
        if(data.user){
            localStorage.setItem('token',data.user)
            alert('Login successful')
            window.location.href='/api'
        }
        else{
            alert('Please check your email and password')
        }
        console.log(data);
    }

    //function for button to redirect to register page
    function redirectToRegister(e){
        navigate("/register", { replace: true });
    }

    //html content with login form
    return(
        <div className="loginform App-header">
            <h1>Login</h1>
            <form onSubmit={loginUser}>
                <input 
                    value={email}
                    type="email" 
                    placeholder="Email"
                    onChange={(e)=>setEmail(e.target.value)}
                />
                <br/>
                <input 
                    value={password}
                    type="password" 
                    placeholder="Password"
                    onChange={(e)=>setPassword(e.target.value)}
                />
                <br/>
                <input type="submit" value="Login" className='generalbtn'/>
            </form>
            <hr/>
            <p>Don't have an account? <button onClick={redirectToRegister} className='generalbtn'>Register</button></p>
            
        </div>
    )
}

export default Login;