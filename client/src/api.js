import React, { useEffect, useState } from 'react';
import axios from 'axios'
import jwt_decode from 'jwt-decode'
import {useNavigate} from 'react-router-dom'
import './api.css';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

var dataHtml="";
var addreq=false;

function API(){
  const navigate=useNavigate()
  const [email,setEmail]=useState('')
  const [historylist,setHistoryList]=useState('')
  const [image, setImage] = useState(null)
  const [addoperation,setStatus]=useState(false)

  //update frontend search history list
  async function populateSearchHistory(){
    const req=await fetch('http://localhost:5000/api/gethistory',{
      method:'POST',
      headers:{
        'x-access-token': localStorage.getItem('token')
      }
    })
    
    const data=await req.json()
    //console.log(data.history)
    dataHtml=""
    if(data.status==='ok'){
      if(data.history.length===0){
        dataHtml="<p>No entries found</p>"
      }
      else{

        dataHtml+="<table>"
        dataHtml+="<tr><th>No.</th><th>Image</th><th>Title Name</th><th>Synopsis</th><th>Episode</th><th>Est Timestamp</th><th>URL</th><th>Searched</th></tr>"
        for(var x=0;x<data.history.length&&x<10;x++){
          dataHtml+="<tr>"
          dataHtml+="<td>"+(x+1)+"</td>"
          dataHtml+="<td><img src='"+data.history[x].aniImageURL+"' height='300px' width='200px'/></td>"
          dataHtml+="<td>"+data.history[x].sceneTitleName+"</td>"
          dataHtml+="<td>"+data.history[x].aniSynopsis+"</td>"
          dataHtml+="<td>"+data.history[x].sceneEpisodeNum+"</td>"
          dataHtml+="<td>"+parseInt(data.history[x].sceneTimeEstimate/60)+":"+(parseInt(data.history[x].sceneTimeEstimate)%60)+"</td>"
          dataHtml+="<td><a href='"+data.history[x].aniURL+"'>Details</a></td>"
          dataHtml+="<td>"+data.history[x].date+" "+data.history[x].time+"</td>"
          dataHtml+="</tr>"
        }
        dataHtml+="</table>"
        dataHtml+="<hr/>"
      }
      
      setHistoryList(dataHtml)
      if(addreq){
        addreq=false
        setStatus(false);
        alert("Results are ready! Check the search history!")
      }
      
    }
    else{
      
      console.log(data.error)
    }
  }


  //useeffect hook to check for authentication token, if not logged in then redirect back
  useEffect(()=>{
    const token=localStorage.getItem('token')
    if(token){
      const user=jwt_decode(token)
      if(!user){
        localStorage.removeItem('token')
        navigate("/login", { replace: true });
      }
      else{
        setEmail(user.email)
        populateSearchHistory()
        console.log(user.email)
        console.log(email)
        
      }
    }
    else{
      navigate("/login", { replace: true });
    }
  },[navigate,email])

  //function to handle image file submission and receiving results from external api
  //then send the retrieved data to back end and updating the history list
  async function handleSearch(e){
    e.preventDefault();
    const data=new FormData(e.target);
    console.log(data.animetitle);

    if(!image){
      alert("Please upload an image")
    }
    else{
      setStatus(true)
      addreq=true;

      var url=`https://api.trace.moe/search?cutBorders&anilistInfo`
      axios.post(url,data).then((res)=>{
        if(res.data.error==""){
          const filteredAnime=res.data.result.filter((anime)=>anime.similarity>0.87);

          console.log(filteredAnime)
          console.log(filteredAnime[0].anilist.title.romaji)
          
          var app_sceneTitleName=filteredAnime[0].anilist.title.romaji
          var app_sceneEpisodeNum=filteredAnime[0].episode
          var app_sceneTimeEstimate=filteredAnime[0].from

          axios.get(`http://localhost:5000/addRecord?titlename=`+app_sceneTitleName+`&epinum=`+app_sceneEpisodeNum+`&esttime=`+app_sceneTimeEstimate+`&email=`+email)
          .then((res) => {
            //console.log(result);
            if (res.data === 'Not found') {
              alert('Anime not found!');
              setStatus(false);
            }
            else{
              populateSearchHistory();
            }
          })
          .catch(error => {
            alert('Anime not found!');
            setStatus(false);
          });
        }
        else{
          alert('Anime not found!');
          console.log(res.data.error);
          setStatus(false);
        }
      })
    }
  }

  //function for logging out
  function userLogout(e){
    localStorage.removeItem('token')
    navigate("/login", { replace: true });
  }

  //function for clearing data related to the current account and updating the front end search history 
  async function clearHistory(e){
    const req=await fetch('http://localhost:5000/api/clearRecord',{
      method:'POST',
      headers:{
        'x-access-token': localStorage.getItem('token')
      }
    })
    
    const data=await req.json()
    console.log(data.history)
    dataHtml=""
    if(data.status==='ok'){
      if(data.history.length===0){
        dataHtml="<p>No entries found</p>"
      }
      else{
        dataHtml+="<table>"
        dataHtml+="<tr><th>No.</th><th>Image</th><th>Title Name</th><th>Synopsis</th><th>Episode</th><th>Est Timestamp</th><th>URL</th><th>Searched</th></tr>"
        for(var x=0;x<data.history.length&&x<10;x++){
          dataHtml+="<tr>"
          dataHtml+="<td>"+(x+1)+"</td>"
          dataHtml+="<td><img src='"+data.history[x].aniImageURL+"' height='300px' width='200px'/></td>"
          dataHtml+="<td>"+data.history[x].sceneTitleName+"</td>"
          dataHtml+="<td>"+data.history[x].aniSynopsis+"</td>"
          dataHtml+="<td>"+data.history[x].sceneEpisodeNum+"</td>"
          dataHtml+="<td>"+parseInt(data.history[x].sceneTimeEstimate/60)+":"+(parseInt(data.history[x].sceneTimeEstimate)%60)+"</td>"
          dataHtml+="<td><a href='"+data.history[x].aniURL+"'>Details</a></td>"
          dataHtml+="<td>"+data.history[x].date+" "+data.history[x].time+"</td>"
          dataHtml+="</tr>"
        }
        dataHtml+="</table>"
        dataHtml+="<hr/>"
      }
      setHistoryList(dataHtml)
    }
    else{
      
      console.log(data.error)
    }
  }

  //Check for file input and update image state to render Image file for preview
  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  }

  //The Html page
  return(
      <div className="App App-header">
        <ul>
          <li><button onClick={userLogout} className="generalbtn">Logout</button></li>
          <li><button onClick={populateSearchHistory} className="generalbtn">Refresh</button></li>
          <li><button onClick={clearHistory} className="generalbtn">Clear History</button></li>
        </ul>
        <hr/>
        <h1>Anime Scene Identifier</h1>
        <p>Upload an image to search the identify the anime of the scene</p>
        <form onSubmit={handleSearch}>
          <br/>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Upload File</Form.Label>
            <Form.Control type="file" name="animeimg" onChange={onImageChange}/>
          </Form.Group>
          <br/>
          <p>Preview image:</p>
          <img src={image}height='250' width='350'/>
          <br/><br/>
          <button type="submit" className='generalbtn' id="submitbtn" disabled={addoperation}>
            {addoperation?<Spinner as='span' animation='grow' size='sm' role='status' aria-hidden='true'/> :"Submit"}
          </button>
        </form>
        
        <br/>
        <hr/>
        <h1>Search history</h1>
        <p>Only the latest 10 entries will be shown</p>
        <div dangerouslySetInnerHTML={{__html: historylist}}/>
      </div>
  )
}

export default API;