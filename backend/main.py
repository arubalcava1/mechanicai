import os
import json

from fastapi import FastAPI, HTTPException
from openai import OpenAI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# core object that runs our API server and handles incoming requests and 
# outgoing responses. It provides a simple and intuitive interface for 
# defining routes, handling requests, and managing the overall behavior of 
# the API.
app = FastAPI()

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:3000"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

#OPENAI client setup
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Data models for request and response bodies

class Vehicle(BaseModel):
	year: int
	make: str
	model: str
	engine: str | None = None #optional field for engine type, e.g., "V6", "V8", "Electric", etc.

#defines structure of incoming chat request
class ChatRequest(BaseModel):
	vehicle: Vehicle
	message: str

# API Endpoints
# Visiting http://127.0.0.1:8000 will return this message
@app.get("/")
def home():
	return{"message": "MechanicAI API running"}

# Health check endpoint
# Used by deployment platforms to verify the server is alive
@app.get("/health")
def health():
	return{"status": "ok"}

from typing import List, Literal

class ChatResponse(BaseModel):
	reply: str
	likely_causes: List[str]
	next_steps: List[str]
	follow_up_questions: List[str]
	risk_level: Literal["low", "medium", "high"]

#Main AI Endpoint
#POST endpoint bc user is sending data
@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

	# convert message to lowercase so we can check keywords
	msg_lower = f"{request.vehicle.make} {request.vehicle.model} {request.message}".lower()

	danger_words = [
		"brake",
		"smoke",
		"fire",
		"fuel leak",
		"overheating",
		"coolant",
		"no oil pressure",
		"stalling on highway"
	]

	# if message contains danger words, return emergency guidance
	if any(word in msg_lower for word in danger_words):
		return {
			"reply": "This could be a safety issue. If the vehicle is smoking, leaking fuel/coolant, overheating, or you suspect brake failure, stop driving immediately and have the vehicle inspected.",
			"likely_causes": [],
			"next_steps": [
				"Stop driving if the vehicle is unsafe.",
				"Check for visible signs of damage or leaks.",
				"Call roadside assistance or a tow truck if necessary."

			],

			"follow_up_questions": [
				"Is there smoke or a burning smell?",
				"Is the tempurature gauge rising rapidly/high?",
				"Are there any warning lights on the dashboard?"
			],
			"risk_level": "high"
		}
	if not os.getenv("OPENAI_API_KEY"):
		raise HTTPException(status_code=500, detail="OpenAI API key not configured")
	
	#system prompt to guide the AI's behavior
	system_prompt = ("You are MechanicAI, a helpful automotive diagnostic assistant."
				  "You must prioritize safety. "
				  "Ask clarifying questions to gather more information about the vehicle's symptoms and conditions. "
				  "Provide step-by-step diagnostic guidance based on the information provided. "
				  "Return structured output with: "
				  "likely_causes, next_steps, follow_up_questions, risk_level."
	)

	#User prompt
	user_prompt = (
		f"vehicle: {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}"
		+ (f" {request.vehicle.engine}" if request.vehicle.engine else "")
		+ f"\nUser symptom: {request.message}\n"
		"Return ONLY valid JSON. No extra text. No markdown. No code fences."
	)

	#Call OpenAI API
	try:
		response = client.chat.completions.create(
			#model used
			model = "gpt-4.1-mini",

			#messages follow standard chat format with system and user prompts
			messages =[
				{"role": "system", "content": system_prompt},
				{"role": "user", "content": user_prompt},
			],
			temperature = 0.2, #controls creativity of response
		)
		#Extract AI's reply from response
		text = response.choices[0].message.content
		#try to parse model output as JSON
		try:
			data = json.loads(text)
			# Fill missing fields if the model forgets them (keeps API stable)
			data.setdefault("reply", "")
			data.setdefault("likely_causes", [])
			data.setdefault("next_steps", [])
			data.setdefault("follow_up_questions", [])
			data.setdefault("risk_level", "medium")
			return data
		except json.JSONDecodeError:
			return {"raw": text, "warning": "Model did not return valid JSON. See 'raw' for full response."}
	
	#if fails return error message
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))
	#API Playground: http://127.0.0.1:8000/docs