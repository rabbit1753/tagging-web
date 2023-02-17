import os
import uvicorn
import json

from fastapi import FastAPI, File, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List, Optional

from fastapi.middleware.cors import CORSMiddleware

story_folder_dir = 'text_and_tagging/text/'

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class EntityArgs(BaseModel):
    Entity_type:str
    Text:str
    Start:str
    End:str
    
class EntityJson(BaseModel):
    Doc_name:str
    Entity_mentions:List[EntityArgs] = []
    
class EventArgs(BaseModel):
    Arg_type:str
    Text:str
    Start:str
    End:str
    
class SingleEvent(BaseModel):
    Event_type:str
    Event_subtype:str
    Arguments:List[EventArgs] = []
    
class EventJson(BaseModel):
    Doc_name:str
    Event_mentions:List[SingleEvent] = []
    
class RelationArgs(BaseModel):
    Arg_type:str
    Text:str
    Start:str
    End:str
    
class SingleRelation(BaseModel):
    Relation_type:str
    Relation_subtype:str
    Arguments:List[RelationArgs] = []
    
class RelationJson(BaseModel):
    Doc_name:str
    Relation_mentions:List[SingleRelation] = []

@app.get('/StoryList')
def get_story_list():
    ret_list = []
    objs = os.listdir(story_folder_dir)
    objs = sorted(objs)
    for obj in objs:
        if (os.path.isfile(story_folder_dir+obj) == True):
            file_name = obj
            
            with open(story_folder_dir+obj, 'r') as f:
                file_content = f.read()
                
            ret_list.append({'file_name':file_name, 'file_content':file_content})
    
    return ret_list

@app.get('/StoryTag/{user_id}/{f_name}')
def get_tagged_tags(user_id:str, f_name:str):
    f_name = f_name.replace('.txt', '.json')
    tabs = ['Entity', 'Relation', 'Event']
    ret_list = []
    for tab in tabs:
        path = 'text_and_tagging/tags/' + user_id + '/' + tab +'/'+f_name
        
        if os.path.exists(path):
            with open(path, 'r') as f:
                labels = json.load(f)
                for label in labels:
                    ret_list.append({'tab':tab, 'label':label})
                    
    return ret_list

@app.post('/LabelResult/Entity/{user_id}')
def save_entity_result(user_id:str, res:EntityJson):
    data = jsonable_encoder(res)
    file_name = data['Doc_name'].replace('.txt', '.json')
    to_write = data['Entity_mentions']
    
    path = 'text_and_tagging/tags/' + user_id + '/Entity/' + file_name
    with open(path, 'w') as fp:
        json.dump(to_write, fp)
    
@app.post('/LabelResult/Event/{user_id}')
def save_event_result(user_id:str, res:EventJson):
    data = jsonable_encoder(res)
    file_name = data['Doc_name'].replace('.txt', '.json')
    to_write = data['Event_mentions']
    
    path = 'text_and_tagging/tags/' + user_id + '/Event/' + file_name
    with open(path, 'w') as fp:
        json.dump(to_write, fp)
    
@app.post('/LabelResult/Relation/{user_id}')
def save_event_result(user_id:str, res:RelationJson):
    data = jsonable_encoder(res)
    file_name = data['Doc_name'].replace('.txt', '.json')
    to_write = data['Relation_mentions']
    
    path = 'text_and_tagging/tags/' + user_id + '/Relation/' + file_name
    with open(path, 'w') as fp:
        json.dump(to_write, fp)
        
@app.post('/LoginRegister/{usr_id}')
def login_or_register(usr_id:str):
    tabs = ['Entity', 'Relation', 'Event']
    for tab in tabs:
        path = 'text_and_tagging/tags/' + usr_id +'/' + tab
        if not os.path.exists(path):
            os.makedirs(path, 777)
    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    
# Run server with command:
# uvicorn --host 0.0.0.0 --reload server:app