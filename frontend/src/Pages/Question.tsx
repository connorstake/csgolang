
import { Button, Grid} from '@mui/material';
import React, { useState } from 'react';
import { DialogueBox } from '../Components/DialogueBox/DialogueBox';
import textData from '../text.json'

import { CodeMirrorWrapper } from '../Components/CodeMirror/CodeMirror';
import Video from '../Components/Video/Video';

import Request from '../api/Request';

import { Console } from '../Components/Console/Console';
import CorrectAnswerModal from '../Components/Modal/CorrectAnswer/CorrectAnswer';
import { Module } from '../Modules/module';
import { Link, useNavigate } from "react-router-dom";
import Confetti from '../Components/Confetti';
import { CourseProgress } from '../Components/CourseProgress/CourseProgress';
import { ModuleImage } from '../Components/CourseProgress/ModuleImage';
import { OpenAI } from '../api/openai';

const ORG_ID = "org-50rpClW7vbD8f1UL4qt8Xh7W"
const API_KEY = "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"

interface QuestionProps {
    module: Module;
    nextModulePath: string;
}

function Question({ module, nextModulePath } : QuestionProps) {

  const [consoleText, setConsoleText] = useState('');
  const [dialogueText, setDialogueText] = useState('');
  const [spaceTimeComplexity, setSpaceTimeComplexity] = useState({space: '', time: '', explanation: ''});
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [completedModalOpen, setCompletedModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [showDialogue, setShowDialogue] = useState(true);


  const navigate = useNavigate();


  const value = localStorage.getItem(module.name) || module.startingCode;

  const nextModule = () => {
        setCompletedModalOpen(false);
        navigate("/" + nextModulePath);
        navigate(0)
  }

  const typeText = (dialogue: string, dialogueHolder: string, nextIndex: number) => {
    if (dialogue.length > 0) {
      setIsTyping(true);
      dialogueHolder += dialogue[0];
      dialogue = dialogue.slice(1);
      setDialogueText(dialogueHolder);
      setTimeout(() => {
        typeText(dialogue, dialogueHolder, nextIndex);
      }, 50);
    } else {
      setTimeout(() => {
      setIsTyping(false);
      setCurrentDialogueIndex(nextIndex);
      }, 1000);
    }
  };


  React.useEffect(() => {
    if (!isTyping && isPlaying) {
    const currentDialogue = module.dialogueByIdx(currentDialogueIndex);
    if (currentDialogue !== '' && currentDialogueIndex + 1 < currentDialogue.length) {
      typeText(currentDialogue, '', currentDialogueIndex + 1);
    } else {
      setTimeout(() => {
        toggleShowVideo();
        togglePlay();
        setCurrentDialogueIndex(0);
      }
      , 1500);
      
    }
  }
  },[module, isTyping, isPlaying]);

  const submitAnswerHandler = async () => {
    setConsoleText('Sending Transmission...');
    const request = new Request(module.solutionURI());
    const value = localStorage.getItem(module.name) || module.startingCode;
    const res = await request.post({ answer: value });
    if (!res.success) {
      setConsoleText(res.output);
    } else {
      const oai = new OpenAI(ORG_ID, API_KEY);
      const evaluation = await oai.evaluateRuntime(value)
      if (evaluation) {
        const cleanedResponse = evaluation.replace(/"{3}$/, '');
        console.log("EVALUATION: ", cleanedResponse)
        setSpaceTimeComplexity(JSON.parse(cleanedResponse))
      }
      setConsoleText('Transmission Received!');
      setCompletedModalOpen(true);
    }  
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  }

  const toggleShowVideo = () => {
    setShowVideo(!showVideo);
  }

  const startVideo = () => {
    setShowVideo(true);
    setIsPlaying(true);
  }

  const skipVideo = () => {
    setShowVideo(false);
    setIsPlaying(false);
  }


  // TODO: This is sloppy, fix it
  const refreshState = () => {
    setShowDialogue(false);
    setShowVideo(false);
    setTimeout(() => {
      navigate(0) 
    }
    , 5);
  }


  return (
    <Grid container style={{height: '100%', backgroundColor: '#edf6f9',  paddingLeft: 50, paddingRight: 50, paddingBottom: 300}}>
      { completedModalOpen && <Confetti />}
        <Grid item xs={12} style={{zIndex: 2}}>
            <Link to="/">
              <img src='/images/logo.png' style={{ height: 80}}/>
            </Link>
        </Grid>
       
      <Grid item xs={12} style={{position: 'absolute', top: '100px'}}>
        <CorrectAnswerModal isOpen={completedModalOpen} completedText={module.completedText} moduleName={module.name} nextModule={nextModule} spaceTimeComplexity={spaceTimeComplexity}/>
      </Grid>
      <Grid item xs={3} >
        <Grid container>
          <Grid container item xs={11} style={{marginBottom: 20}} >
            <Grid item xs={12} >
              <ModuleImage imagePath={module.imagePath}/>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} >
          <CourseProgress refreshState={refreshState}/>
        </Grid>
      </Grid>
      <Grid item xs={9}>
        <Grid style={{backgroundColor:'rgba(117,117,117, 0.2)', padding: 30, borderRadius: 10, paddingTop: 20,  boxShadow: "0px 16px 15px rgba(117,117,117, 0.2)", border:"solid rgba(117,117,117, 0.20) .2px"}}>
          <Grid container style={{marginBottom: 10}}>
            <div style={{backgroundColor: '#ed6a5e', height:'12px', width:'12px', borderRadius: '100%', marginRight: 5}}></div>
            <div style={{backgroundColor: '#f4bd4e', height:'12px', width:'12px', borderRadius: '100%', marginRight: 5}}></div>
            <div style={{backgroundColor: '#00e600', height:'12px', width:'12px', borderRadius: '100%', marginRight: 5}}></div>
          </Grid>
        <Grid container style={{position: 'relative'}}>
          <Grid item xs={12} style={{position: 'relative'}} >
          {showVideo && <Grid style={{position: 'absolute', height:'100%', width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex:5, borderRadius: 5}}></Grid> }
            <CodeMirrorWrapper  value={value} localStorageKey={module.name}/>
          </Grid>
          {showVideo && showDialogue &&
          <Grid item xs={4} style={{position: 'absolute', right:0, zIndex: 10}}>
            <Video src={module.videoPath} isPlaying={isPlaying}/>
            <DialogueBox dialogue={dialogueText}/>
            {
          showVideo && !isPlaying &&
          <Grid container spacing={2} style={{position: 'relative', zIndex:6 }}>
            <Grid item xs={6}>
              <Button style={{backgroundColor: '#006d77', width:'100%', color:'white', fontWeight:'bold'}} onClick={startVideo}>Play Video</Button>
            </Grid>
            <Grid item xs={6}>
              <Button style={{backgroundColor: '#e29578', width:'100%', color:'white', fontWeight:'bold'}} onClick={skipVideo}>Skip Video</Button>
            </Grid>
          </Grid> 
          }
          </Grid>
          }
        </Grid>
          <Grid item xs={12} style={{backgroundColor: 'black', minHeight: '100px', color: 'white', fontSize: 14, padding: 15}}>
            <Console consoleText={consoleText}/>
          </Grid>
          {!showVideo &&
          <Grid>
          <Grid item xs={3} style={{marginTop: '10px'}}>
            <Button onClick={submitAnswerHandler} style={{backgroundColor: "#006d77", color: "white", boxShadow: "0px 16px 15px rgb(112, 144, 176, .20)", border:"solid rgb(112, 144, 176, .20) 1px"}}>Send Transmission</Button>
          </Grid>
          {/* <Grid>
            <Button onClick={startVideo} style={{backgroundColor: "black", color: "green", border:'solid green 2px'}}>Show Video</Button>
          </Grid> */}
          </Grid>
          }
      </Grid>
      </Grid>
    </Grid>
  )
}


export default Question;
