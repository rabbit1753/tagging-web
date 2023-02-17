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

# story_folder_dir = 'text_and_tagging/text/'
story_folder_dir = 'text_and_tagging/Fairytale/train/'
# story_folder_dir = 'text_and_tagging/Fairytale/valid/answer/'
# story_folder_dir = 'text_and_tagging/Fairytale/valid/question/'

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

# class TimestampArgs(BaseModel):
#     Story_name:str
#     Timestamp:int

class TimestampJson(BaseModel):
    Doc_name:str
    Timestamp_mentions:str
    
class EventArgs(BaseModel):
    Arg_type:str
    Text:str
    Start:str
    End:str
    
class SingleEvent(BaseModel):
    which_QA:str
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
    which_QA:str
    Relation_type:str
    Relation_subtype:str
    Arguments:List[RelationArgs] = []
    
class RelationJson(BaseModel):
    Doc_name:str
    Relation_mentions:List[SingleRelation] = []

@app.get('/StoryList')
def get_story_list():
    ret_list = []

    content_path = story_folder_dir + 'content/'
    answer_path = story_folder_dir + 'answer/'
    question_path = story_folder_dir + 'question/'
    attribute_path = story_folder_dir + 'attribute/'

    content_objs = sorted(os.listdir(content_path))
    answer_objs = sorted(os.listdir(answer_path))
    question_objs = sorted(os.listdir(question_path))
    attribute_objs = sorted(os.listdir(attribute_path))
    
    # content_objs = sorted(content_objs)
    # answer_objs = sorted(answer_objs)
    # question_objs = sorted(question_objs)

    index = 0

    for c_obj in content_objs:
        if (os.path.isfile(content_path+c_obj) == True):
            file_name = c_obj

            with open(content_path+c_obj, 'r') as f:
                file_content = f.read()

            a_obj = answer_objs[index]
            q_obj = question_objs[index]
            attr_obj = attribute_objs[index]

            Q_list = []
            A_list = []
            attr_list = []
            while c_obj[:-4] in a_obj:

                QA_name = a_obj
                with open(answer_path+a_obj, 'r') as f:
                    file_answer = f.read()

                with open(question_path+q_obj, 'r') as f:
                    file_question = f.read()
                
                with open(attribute_path+attr_obj, 'r') as f:
                    file_attribute = f.read()
                
                Q_list.append({'file_name':QA_name, 'question':file_question})
                A_list.append({'file_name':QA_name, 'answer':file_answer})
                attr_list.append({'filename':QA_name, 'attribute':file_attribute})

                index += 1
                if index == len(answer_objs):
                    break;
                a_obj = answer_objs[index]
                q_obj = question_objs[index]
                attr_obj = attribute_objs[index]

            ret_list.append({'file_name':file_name, 'file_content':file_content, 
            'file_answer':A_list, 'file_question':Q_list, 'file_attribute':attr_list})
    
    return ret_list

# @app.get('/StoryList') 原始版本的 code，先保留著
# def get_story_list():
#     ret_list = []
#     objs = os.listdir(story_folder_dir)
#     objs = sorted(objs)
#     for obj in objs:
#         if (os.path.isfile(story_folder_dir+obj) == True):
#             file_name = obj
            
#             with open(story_folder_dir+obj, 'r') as f:
#                 file_content = f.read()
                
#             ret_list.append({'file_name':file_name, 'file_content':file_content})
    
#     return ret_list

@app.get('/StoryTag/{user_id}/Fairytale/{f_name}')
def get_tagged_tags(user_id:str, f_name:str):
    f_name = f_name.replace('.txt', '.json')
    tabs = ['Entity', 'Relation', 'Event']
    ret_list = []
    for tab in tabs:
        path = 'text_and_tagging/tags/' + user_id + '/Fairytale/' + tab +'/'+f_name
        
        if os.path.exists(path):
            with open(path, 'r') as f:
                labels = json.load(f)
                for label in labels:
                    ret_list.append({'tab':tab, 'label':label})
                    
    return ret_list

@app.post('/LabelResult/Timestamp/{user_id}')
def save_timestamp_result(user_id:str, res:TimestampJson):
    data = jsonable_encoder(res)
    file_name = data['Doc_name']
    to_write = data['Timestamp_mentions']
    
    path = 'text_and_tagging/tags/' + user_id + '/Fairytale/Timestamp/' + file_name
    with open(path, 'a', encoding='utf-8') as fp:
        json.dump(to_write, fp)
        fp.write('\n')

@app.post('/LabelResult/Entity/{user_id}')
def save_entity_result(user_id:str, res:EntityJson):
    data = jsonable_encoder(res)
    file_name = data['Doc_name'].replace('.txt', '.json')
    to_write = data['Entity_mentions']
    
    path = 'text_and_tagging/tags/' + user_id + '/Fairytale/Entity/' + file_name
    with open(path, 'w', encoding='utf-8') as fp:
        json.dump(to_write, fp)
    
@app.post('/LabelResult/Event/{user_id}')
def save_event_result(user_id:str, res:EventJson):
    data = jsonable_encoder(res)
    file_name = data['Doc_name'].replace('.txt', '.json')
    to_write = data['Event_mentions']
    
    path = 'text_and_tagging/tags/' + user_id + '/Fairytale/Event/' + file_name
    with open(path, 'w', encoding='utf-8') as fp:
        json.dump(to_write, fp)
    
@app.post('/LabelResult/Relation/{user_id}')
def save_relation_result(user_id:str, res:RelationJson):
    data = jsonable_encoder(res)
    file_name = data['Doc_name'].replace('.txt', '.json')
    to_write = data['Relation_mentions']

    path = 'text_and_tagging/tags/' + user_id + '/Fairytale/Relation/' + file_name
    with open(path, 'w', encoding='utf-8') as fp:
        json.dump(to_write, fp)
        
@app.post('/LoginRegister/{usr_id}')
def login_or_register(usr_id:str):
    tabs = ['Entity', 'Relation', 'Event','Timestamp']
    for tab in tabs:
        path = 'text_and_tagging/tags/' + usr_id +'/Fairytale/' + tab
        if not os.path.exists(path):
            os.makedirs(path, 777)
    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080, reload=True)
    
# Run server with command:
# uvicorn --host 0.0.0.0 --reload server:app