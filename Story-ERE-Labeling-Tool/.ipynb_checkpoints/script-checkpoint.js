var btn_commit = document.getElementById('commit_btn');
var file_selector = document.getElementById('file_selector');
var select1 = document.getElementById('select_1');
var select2 = document.getElementById('select_2');
var select3 = document.getElementById('select_3');
var args_display = document.getElementById('args_display');
var tag_display = document.getElementById('nav-home');

select2.style.display = 'none';
select3.style.display = 'none';

var current_tab = 'Entity';

var args = [];
var taggings = [];
var temp_tag = [];

var user_id = 'visitor';

var flag = -1;

// event listerer when click commit button
function click_commit() {
    filted_tag = [];

    for (let i = 0; i < taggings.length; i++) {
        if (taggings[i]['tab'] != current_tab) {
            continue;
        }
        filted_tag.push(taggings[i]);
    }

    if (current_tab == "Entity") {
        let mentions = [];
        let url = "http://140.115.54.59:8000/LabelResult/Entity/" + user_id;


        for (let i = 0; i < filted_tag.length; i++) {
            // i indicate i-th tag
            let temp = {
                "Entity_type": filted_tag[i]['entity_type'],
                "Text": filted_tag[i]['args'][0]["Text"],
                "Start": filted_tag[i]['args'][0]["Start"],
                "End": filted_tag[i]['args'][0]["End"]
            }
            mentions.push(temp);
        }
        let data = {
            "Doc_name": stories_json[file_selector.value].file_name,
            "Entity_mentions": mentions
        }

        post_result_to_server(url, data);
    } else if (current_tab == "Event") {
        let mentions = [];

        let url = "http://140.115.54.59:8000/LabelResult/Event/" + user_id;

        for (let i = 0; i < filted_tag.length; i++) {
            // i indicate i-th tag
            let event_type = filted_tag[i]['event_type']
            let event_subtype = filted_tag[i]['event_subtype']
            let event_args = []
            for (let j = 0; j < filted_tag[i]['args'].length; j++) {
                // j indicate j-th argument in i-th event
                let arg = {
                    "Arg_type": filted_tag[i]['args'][j]["Arg_type"],
                    "Text": filted_tag[i]['args'][j]["Text"],
                    "Start": filted_tag[i]['args'][j]["Start"],
                    "End": filted_tag[i]['args'][j]["End"]
                }
                event_args.push(arg);
            }
            let single_event = {
                "Event_type": event_type,
                "Event_subtype": event_subtype,
                "Arguments": event_args
            }
            mentions.push(single_event);
        }
        let data = {
            "Doc_name": stories_json[file_selector.value].file_name,
            "Event_mentions": mentions
        }
        post_result_to_server(url, data);
    } else if (current_tab == "Relation") {
        let mentions = [];

        let url = "http://140.115.54.59:8000/LabelResult/Relation/" + user_id;

        for (let i = 0; i < filted_tag.length; i++) {
            // i indicate i-th tag
            let relation_type = filted_tag[i]['relation_type']
            let relation_subtype = filted_tag[i]['relation_subtype']
            let relation_args = []
            for (let j = 0; j < filted_tag[i]['args'].length; j++) {
                // j indicate j-th argument in i-th relation
                let arg = {
                    "Arg_type": filted_tag[i]['args'][j]["Arg_type"],
                    "Text": filted_tag[i]['args'][j]["Text"],
                    "Start": filted_tag[i]['args'][j]["Start"],
                    "End": filted_tag[i]['args'][j]["End"]
                }
                relation_args.push(arg);
            }
            let single_event = {
                "Relation_type": relation_type,
                "Relation_subtype": relation_subtype,
                "Arguments": relation_args
            }
            mentions.push(single_event);
        }
        let data = {
            "Doc_name": stories_json[file_selector.value].file_name,
            "Relation_mentions": mentions
        }
        post_result_to_server(url, data);
    }
}

function post_result_to_server(url, data) {
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response))
        .then(response => alert("Commit Successfully!"));

}

// event listener when click done button
function click_Done() {
    if (args.length == 0) {
        return;
    }
    let dict;
    if (current_tab == "Entity") {
        dict = {
            'tab': current_tab,
            'entity_type': select1.value,
            'args': args
        };
    } else if (current_tab == "Relation") {
        dict = {
            'tab': current_tab,
            'relation_type': select1.value,
            'relation_subtype': select2.value,
            'args': args
        };
    } else if (current_tab == "Event") {
        dict = {
            'tab': current_tab,
            'event_type': select1.value,
            'event_subtype': select2.value,
            'args': args
        };
    }
    taggings.push(dict);
    args = [];

    refresh_tag_display();
    reset_args_display();
}

// event listener when click CreateArg button
function click_CreateArg() {
    selectedTexts = window.getSelection();
    let text = window.getSelection().toString();
    let anchor_node = window.getSelection().anchorNode.parentNode;
    let focus_node = window.getSelection().focusNode.parentNode;
    let start = anchor_node.dataset.value;
    let end = focus_node.dataset.value;

    if (parseInt(start, 10) < parseInt(end, 10)) {
        end = (parseInt(end, 10) + 1).toString();
    } else {
        let temp = start;
        start = end;
        end = (parseInt(temp, 10) + 1).toString();
    }

    if (current_tab == 'Event') {
        let arg_type = select3.value;
        let arg = create_event_obj(arg_type, text, start, end);
        args.push(arg);
    } else if (current_tab == 'Entity') {
        let arg_type = select1.value;
        let arg = create_entity_obj(arg_type, text, start, end);
        args.push(arg);
    } else if (current_tab == 'Relation') {
        let arg_type = select3.value;
        let arg = create_relation_obj(arg_type, text, start, end);
        args.push(arg);
    }

    refresh_args_display();
}

// event listener when click tag
function click_tag(wrapper) {
    let num = wrapper.dataset.value;
    args = taggings[num]['args'];
    if (current_tab == "Event") {
        let sel2_val = taggings[num]['event_subtype'];
        for (let key in menu1_menu2) {
            if (menu1_menu2[key].includes(sel2_val)) {
                select1.value = key;
                select1_changed();
                select2.value = sel2_val;
                select2_changed();
                break;
            }
        }
    }
    taggings.splice(num, 1);

    refresh_tag_display();
    refresh_args_display();
}

// event listener when click tag delete button
function del_tag(btn) {
    let num = btn.dataset.value;
    taggings.splice(num, 1);

    refresh_tag_display();
}

// event listener when click arg delete button
function del_arg(btn) {
    let num = btn.dataset.value;
    args.splice(num, 1);

    refresh_args_display();
}

// event listener when mouse moves into the tag area
function over_tag(wrapper) {
    let style = getComputedStyle(wrapper)
    wrapper.style.backgroundColor = style.backgroundColor.replace(unselected_opacity, selected_opacity);

    let content = document.getElementById('card_content');
    let children = content.children;
    let num = wrapper.dataset.value;

    if (taggings[num]['tab'] != current_tab) {
        return;
    }

    for (let i = 0; i < taggings[num]['args'].length; i++) {
        for (let j = 0; j < taggings[num]['args'].length; j++) {
            for (let k = parseInt(taggings[num]['args'][j]['Start']); k < parseInt(taggings[num]['args'][j]['End']); k++) {
                let child_style = getComputedStyle(children[k]);
                children[k].style.backgroundColor = child_style.backgroundColor.replace(unselected_opacity, selected_opacity);
            }
        }
    }
}

// event listener when mouse moves out the tag area
function leave_tag(wrapper) {
    let style = getComputedStyle(wrapper)
    wrapper.style.backgroundColor = style.backgroundColor.replace(selected_opacity, unselected_opacity);

    let content = document.getElementById('card_content');
    let children = content.children;
    let num = wrapper.dataset.value;

    for (let i = 0; i < taggings[num]['args'].length; i++) {
        for (let j = 0; j < taggings[num]['args'].length; j++) {
            for (let k = parseInt(taggings[num]['args'][j]['Start']); k < parseInt(taggings[num]['args'][j]['End']); k++) {
                let child_style = getComputedStyle(children[k]);
                children[k].style.backgroundColor = child_style.backgroundColor.replace(selected_opacity, unselected_opacity);
            }
        }
    }
}

// generate a entity tag
function create_entity_obj(arg_type, text, start, end) {
    let arg = {
        'Arg_type': arg_type,
        'Text': text,
        'Start': start,
        'End': end
    }

    return arg;
}

// generate a relation tag
function create_relation_obj(arg_type, text, start, end) {
    let arg = {
        'Arg_type': arg_type,
        'Text': text,
        'Start': start,
        'End': end
    }

    return arg;
}

// generate a event tag
function create_event_obj(arg_type, text, start, end) {
    let arg = {
        'Arg_type': arg_type,
        'Text': text,
        'Start': start,
        'End': end
    }

    return arg;
}

// reset the args display area
function reset_args_display() {
    while (args_display.firstChild) {
        args_display.removeChild(args_display.firstChild);
    }
}

// reset the tags display area
function reset_tag_display() {
    while (tag_display.firstChild) {
        tag_display.removeChild(tag_display.firstChild);
    }
}

// reset the selection bars
function reset_tagging_selections() {
    while (select1.firstChild) {
        select1.removeChild(select1.firstChild);
    }
    select2.style.display = 'none';
    select3.style.display = 'none';
}

// set the story background to white
function reset_story_color() {
    let content = document.getElementById('card_content');
    let children = content.children;

    for (let i = 0; i < children.length; i++) {
        children[i].style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    }
}

// refresh the args display area
function refresh_args_display() {
    // reset the args list first
    reset_args_display();

    // generate args according to args list
    for (let i = 0; i < args.length; i++) {
        let wrapper = document.createElement('div');
        let del_btn = get_delBtn(i, 'arg');
        let arg_type = document.createElement('span');
        arg_type.innerHTML = args[i]['Arg_type'];
        let text = document.createElement('span');
        text.innerHTML = args[i]['Text'];
        wrapper.appendChild(del_btn);
        wrapper.appendChild(arg_type);
        wrapper.appendChild(text);
        args_display.appendChild(wrapper);
    }
}

function compare(tag_a, tag_b) {
    rep_a = 1000000
    rep_b = 1000000
    for (let i = 0; i < tag_a['args'].length; i++) {
        if (tag_a['args'][i]['Start'] < rep_a) {
            rep_a = tag_a['args'][i]['Start']
        }
    }
    for (let i = 0; i < tag_b['args'].length; i++) {
        if (tag_b['args'][i]['Start'] < rep_b) {
            rep_b = tag_b['args'][i]['Start']
        }
    }
    
    return rep_a - rep_b
}

// refresh the tags display area
function refresh_tag_display() {
    reset_tag_display();
  
    taggings.sort(compare)

    for (let i = 0; i < taggings.length; i++) {
        if (taggings[i]['tab'] != current_tab) {
            continue;
        }

        let wrapper;
        if (current_tab == "Entity") {
            wrapper = entity_displayer(i);
        } else if (current_tab == "Relation") {
            wrapper = relation_displayer(i);
        } else if (current_tab == "Event") {
            wrapper = event_displayer(i);
        }

        tag_display.appendChild(wrapper);
    }

    refresh_story();
}

// refresh the story display area
function refresh_story() {
    reset_story_color();

    let content = document.getElementById('card_content');
    let children = content.children;
    for (let i = 0; i < taggings.length; i++) {
        // we only show the tag which belongs to current tab
        if (taggings[i]['tab'] != current_tab) {
            continue;
        }

        for (let j = 0; j < taggings[i]['args'].length; j++) {
            // k 用來指定文章中字的範圍
            for (let k = parseInt(taggings[i]['args'][j]['Start']); k < parseInt(taggings[i]['args'][j]['End']); k++) {
                let filter = taggings[i]['tab'];

                if (filter == "Entity") {
                    let color = taggings[i]['entity_type'];
                    children[k].style.backgroundColor = 'rgba(' + entity_rgb[color]["R"] + ',' + entity_rgb[color]["G"] + ',' +
                        entity_rgb[color]["B"] + ',' + unselected_opacity + ')';
                } else if (filter == "Relation") {
                    let color = taggings[i]['relation_subtype'];
                    children[k].style.backgroundColor = 'rgba(' + relation_rgb[color]["R"] + ',' + relation_rgb[color]["G"] + ',' +
                        relation_rgb[color]["B"] + ',' + unselected_opacity + ')';

                } else if (filter == "Event") {
                    let color = taggings[i]['event_subtype'];
                    children[k].style.backgroundColor = 'rgba(' + event_rgb[color]["R"] + ',' + event_rgb[color]["G"] + ',' +
                        event_rgb[color]["B"] + ',' + unselected_opacity + ')';
                }
            }
        }
    }
}

function entity_displayer(i) {
    let wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'row');
    let del_btn = get_delBtn(i, 'tag');
    let color = taggings[i]['entity_type'];
    let r = entity_rgb[color]["R"];
    let g = entity_rgb[color]["G"];
    let b = entity_rgb[color]["B"];
    let tag_wrapper = get_tagWrapper(i, r, g, b);

    for (let j = 0; j < taggings[i]['args'].length; j++) {
        let arg_wrapper = document.createElement('div');
        arg_wrapper.style.width = 'fit-content';
        let arg = document.createElement('span');
        arg.innerHTML = taggings[i]['args'][j]['Arg_type'];
        let text = document.createElement('span');
        text.innerHTML = taggings[i]['args'][j]['Text'];

        arg_wrapper.appendChild(arg);
        arg_wrapper.appendChild(text);
        tag_wrapper.appendChild(arg_wrapper);
    }
    wrapper.appendChild(del_btn);
    wrapper.appendChild(tag_wrapper);

    return wrapper;
}

function relation_displayer(i) {
    let wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'row');
    let del_btn = get_delBtn(i, 'tag');
    let color = taggings[i]['relation_subtype'];
    let r = relation_rgb[color]["R"];
    let g = relation_rgb[color]["G"];
    let b = relation_rgb[color]["B"];
    let tag_wrapper = get_tagWrapper(i, r, g, b);

    let type_wrapper = document.createElement('div');
    type_wrapper.style.width = 'fit-content';
    let _type = document.createElement('span');
    _type.innerHTML = "Type";
    let type_text = document.createElement('span');
    type_text.innerHTML = taggings[i]['relation_type'];
    type_wrapper.appendChild(_type);
    type_wrapper.appendChild(type_text);
    tag_wrapper.appendChild(type_wrapper);

    let subtype_wrapper = document.createElement('div');
    type_wrapper.style.width = 'fit-content';
    let _subtype = document.createElement('span');
    _subtype.innerHTML = "Subtype";
    let subtype_text = document.createElement('span');
    subtype_text.innerHTML = taggings[i]['relation_subtype'];
    subtype_wrapper.appendChild(_subtype);
    subtype_wrapper.appendChild(subtype_text);
    tag_wrapper.appendChild(subtype_wrapper);

    for (let j = 0; j < taggings[i]['args'].length; j++) {
        let arg_wrapper = document.createElement('div');
        arg_wrapper.style.width = 'fit-content';
        let arg = document.createElement('span');
        arg.innerHTML = taggings[i]['args'][j]['Arg_type'];
        let text = document.createElement('span');
        text.innerHTML = taggings[i]['args'][j]['Text'];

        arg_wrapper.appendChild(arg);
        arg_wrapper.appendChild(text);
        tag_wrapper.appendChild(arg_wrapper);
    }
    wrapper.appendChild(del_btn);
    wrapper.appendChild(tag_wrapper);

    return wrapper;
}

function event_displayer(i) {
    let wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'row');
    let del_btn = get_delBtn(i, 'tag');
    let color = taggings[i]['event_subtype'];
    let r = event_rgb[color]["R"];
    let g = event_rgb[color]["G"];
    let b = event_rgb[color]["B"];
    let tag_wrapper = get_tagWrapper(i, r, g, b);

    let event_wrapper = document.createElement('div');
    event_wrapper.style.width = 'fit-content';
    let EVENT = document.createElement('span');
    EVENT.innerHTML = "Event";
    let event_name = document.createElement('span');
    event_name.innerHTML = taggings[i]['event_subtype'];
    event_wrapper.appendChild(EVENT);
    event_wrapper.appendChild(event_name);
    tag_wrapper.appendChild(event_wrapper);

    for (let j = 0; j < taggings[i]['args'].length; j++) {
        let arg_wrapper = document.createElement('div');
        arg_wrapper.style.width = 'fit-content';
        let arg = document.createElement('span');
        arg.innerHTML = taggings[i]['args'][j]['Arg_type'];
        let text = document.createElement('span');
        text.innerHTML = taggings[i]['args'][j]['Text'];

        arg_wrapper.appendChild(arg);
        arg_wrapper.appendChild(text);
        tag_wrapper.appendChild(arg_wrapper);
    }
    wrapper.appendChild(del_btn);
    wrapper.appendChild(tag_wrapper);

    return wrapper;
}

function get_tagWrapper(i, r, g, b) {
    let tag_wrapper = document.createElement('div');
    tag_wrapper.setAttribute('onmouseenter', 'over_tag(this)');
    tag_wrapper.setAttribute('onmouseleave', 'leave_tag(this)');
    tag_wrapper.setAttribute('onclick', 'click_tag(this)');
    tag_wrapper.setAttribute('data-value', i);
    tag_wrapper.style.backgroundColor = 'rgba(' + r + ',' +
        g + ',' + b + ',' + unselected_opacity + ')';
    tag_wrapper.style.border = '2px solid black';
    tag_wrapper.style.width = 'fit-content';


    return tag_wrapper;
}

function get_delBtn(i, type) {
    let del_btn = document.createElement('button');
    del_btn.setAttribute('type', 'button');
    del_btn.setAttribute('class', 'btn-close');
    del_btn.setAttribute('aria-label', 'Close');
    del_btn.setAttribute('data-value', i);
    if (type == 'tag') {
        del_btn.setAttribute('onclick', 'del_tag(this)');
    } else if (type == 'arg') {
        del_btn.setAttribute('onclick', 'del_arg(this)');
    }

    return del_btn;
}

function file_selected() {
    flag = -1;

    let search_bar = document.getElementById("exampleDataList");
    search_bar.value = ""
    args = [];
    taggings = [];
    temp_tag = [];
    refresh_tag_display();
    refresh_args_display();
}


function file_searched(search_bar) {
    // console.log(search_bar.value)
    flag = -1;
    for (let i = 0; i < stories_json.length; i++) {
        if (stories_json[i].file_name == search_bar.value) {
            file_selector.value = i;
            args = [];
            taggings = [];
            temp_tag = [];
            refresh_tag_display();
            refresh_args_display();
        }
    }
}

function click_Check() {
    let val = file_selector.value;
    display_story(stories_json[val].file_name, stories_json[val].file_content, flag);
    get_tagged_tags(stories_json[val].file_name);
}

function remove_all_options() {
    while (select1.firstChild) {
        select1.removeChild(select1.firstChild);
    }
}

function generate_options_1(tab) {
    let select1_opts = ERE_menu1[tab];

    for (let i = 0; i < select1_opts.length; i++) {
        let option = document.createElement('option');
        option.text = select1_opts[i];
        option.value = select1_opts[i];
        select1.appendChild(option);
    }
}

function select1_changed() {
    let opt_value = select1.value;
    let select2_opts = menu1_menu2[opt_value];
    if (typeof select2_opts == "undefined") {
        select2.style.display = 'none';
        select3.style.display = 'none';
    } else {
        select2.style.display = 'block';
        while (select2.firstChild) {
            select2.removeChild(select2.firstChild);
        }
        for (let i = 0; i < select2_opts.length; i++) {
            let option = document.createElement('option');
            option.text = select2_opts[i];
            option.value = select2_opts[i];
            select2.appendChild(option);
        }
        select2_changed();
    }
}

function select2_changed() {
    let opt_value = select2.value;
    let select3_opts = menu2_menu3[opt_value];
    console.log(select3_opts)
    console.log('hi')
    if (current_tab == "Relation") {
        select3.style.display = 'block';
        let relation_select3 = menu2_menu3["Relation_Args"];
        while (select3.firstChild) {
            select3.removeChild(select3.firstChild);
        }
        for (let i = 0; i < relation_select3.length; i++) {
            let option = document.createElement('option');
            option.text = relation_select3[i];
            option.value = relation_select3[i];
            select3.appendChild(option);
        }
    } else if (typeof select3_opts == "undefined") {
        select3.style.display = 'none';
    } else {
        select3.style.display = 'block';
        while (select3.firstChild) {
            select3.removeChild(select3.firstChild);
        }
        for (let i = 0; i < select3_opts.length; i++) {
            let option = document.createElement('option');
            option.text = select3_opts[i];
            option.value = select3_opts[i];
            select3.appendChild(option);
        }
    }
}

// event listener when user change the tab
function change_tab(btn) {
    current_tab = btn.innerHTML;
    reset_tagging_selections();
    args = [];
    reset_args_display();

    generate_options_1(btn.dataset.value);
    select1_changed();

    refresh_story();
    refresh_tag_display();
}

var stories_json;

function GetSortOrder(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

// get the story list and content from server
function get_story_data() {
    let url = 'http://140.115.54.59:8000/StoryList';
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            stories_json = myJson.sort(GetSortOrder("file_name"));
            generate_file_list();
        });
}

function load_previous_tag(tags) {
    for (let i = 0; i < tags.length; i++) {
        let filter = tags[i]['tab'];
        if (filter == "Entity") {
            let arg_type = tags[i]["label"]["Entity_type"];
            let text = tags[i]["label"]["Text"];
            let start = tags[i]["label"]["Start"];
            let end = tags[i]["label"]["End"];
            let arg = create_entity_obj(arg_type, text, start, end);

            args.push(arg);

            let dict = {
                'tab': filter,
                'entity_type': arg_type,
                'args': args
            };

            taggings.push(dict);
            args = [];
        } else if (filter == "Relation") {
            let relation_type = tags[i]["label"]["Relation_type"];
            let relation_subtype = tags[i]["label"]["Relation_subtype"];

            for (let j = 0; j < tags[i]["label"]["Arguments"].length; j++) {
                let arg_type = tags[i]["label"]["Arguments"][j]["Arg_type"];
                let text = tags[i]["label"]["Arguments"][j]["Text"];
                let start = tags[i]["label"]["Arguments"][j]["Start"];
                let end = tags[i]["label"]["Arguments"][j]["End"];

                let arg = create_relation_obj(arg_type, text, start, end);
                args.push(arg);
            }

            dict = {
                'tab': filter,
                'relation_type': relation_type,
                'relation_subtype': relation_subtype,
                'args': args
            };

            taggings.push(dict);
            args = [];
        } else if (filter == "Event") {
            let event_type = tags[i]["label"]["Event_type"];
            let event_subtype = tags[i]["label"]["Event_subtype"];

            for (let j = 0; j < tags[i]["label"]["Arguments"].length; j++) {
                let arg_type = tags[i]["label"]["Arguments"][j]["Arg_type"];
                let text = tags[i]["label"]["Arguments"][j]["Text"];
                let start = tags[i]["label"]["Arguments"][j]["Start"];
                let end = tags[i]["label"]["Arguments"][j]["End"];

                let arg = create_event_obj(arg_type, text, start, end);
                args.push(arg);
            }

            dict = {
                'tab': filter,
                'event_type': event_type,
                'event_subtype': event_subtype,
                'args': args
            };

            taggings.push(dict);
            args = [];
        }
    }
    refresh_tag_display();
}

function get_tagged_tags(file_name) {
    let url = 'http://140.115.54.59:8000/StoryTag/' + user_id + '/'
    url = url + file_name;

    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            load_previous_tag(myJson);
        });
}

// generate options (file list) to file selector
function generate_file_list() {
    var datalistOptions = document.getElementById('datalistOptions');
    for (let i = 0; i < stories_json.length; i++) {
        let option = document.createElement('option');
        option.text = stories_json[i].file_name;
        option.value = i;
        file_selector.appendChild(option);

        let datalistopt = document.createElement('option');
        datalistopt.value = stories_json[i].file_name;
        datalistOptions.appendChild(datalistopt);
    }
}

// display story content at story display area
function display_story(f_title, f_cont, flag) {
    let title = document.getElementById('card_title');
    let content = document.getElementById('card_content');

    title.textContent = f_title;
    while (content.firstChild) {
        content.removeChild(content.firstChild);
    }
    if (flag == 0) {
        var tok_list = tokenization_ch(f_cont);
    }
    else if (flag == 1) {
        var tok_list = tokenization_en(f_cont);
    }

    for (let i = 0; i < tok_list.length; i++) {
        let spam = document.createElement('spam');
        spam.innerHTML = tok_list[i];
        spam.dataset.value = i;
        content.appendChild(spam);
    }
}

function tokenization_ch(string) {
    let exp = new RegExp('([\u4e00-\u9fa5:：!！「」，。?？])');
    let ret_list = [];
    let splited = string.split(exp);

    for (let tok = 0; tok < splited.length; tok++) {
        if (splited[tok].trim().length > 0) {
            ret_list.push(splited[tok].trim());
        }
    }

    return ret_list;
}

function tokenization_en(string) {
    let exp = new RegExp('([\t\n\v\f\r \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000,!?."])');
    let ret_list = [];
    let splited = string.split(exp);

    for (let tok = 0; tok < splited.length; tok++) {
        if (splited[tok].trim().length > 0) {
            ret_list.push(splited[tok].trim());

            if (splited[tok + 1] == ',' || splited[tok + 1] == '!' || splited[tok + 1] == '.' || splited[tok + 1] == '?' || splited[tok + 1] == '"') {
                continue;
            }
            else {
                ret_list.push(" ");
            }
        }
    }

    return ret_list;
}

function login_or_register() {
    user_id = prompt("請輸入學號或一個屬於你的代號");
    console.log(user_id);

    document.title = 'Story Tagging - ' + user_id

    let url = 'http://140.115.54.59:8000/LoginRegister/' + user_id;
    fetch(url, {
        method: 'POST',
        body: user_id,
        headers: new Headers({
            'Content-Type': 'text/html'
        })
    }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response))
}

login_or_register();
get_story_data();

function click_Ch() {
    flag = 0;
    var x = document.getElementById('story_ch');
    var y = document.getElementById('story_en');

    x.style.backgroundColor = "#2626FF";
    y.style.backgroundColor = "#C4C4C4";

}

function click_En() {
    flag = 1;

    var x = document.getElementById('story_ch');
    var y = document.getElementById('story_en');

    x.style.backgroundColor = "#C4C4C4";
    y.style.backgroundColor = "#2626FF";
}

var ERE_menu1 = {
    "Entity": ["Per", "Org", "Loc", "Fac", "Veh", "Wea", "Gpe", "Unk"],
    "Relation": ["ART (artifact)", "GEN-AFF (Gen-affiliation)", "METONYMY",
                 "ORG-AFF (Org-affiliation)", "PART-WHOLE", "PER-SOC (person-social)",
                 "PHYS (physical)", "Coreference", "Unk", "Casual Effect"],
    "Event": ["Life", "Movement", "Transaction", "Business", "Conflict",
              "Contact", "Personnel", "Justice", "Process", "State", "Action"]
};

var menu1_menu2 = {
    "Life": ["Be-Born", "Marry", "Divorce", "Injure", "Die"],
    "Movement": ["Transport"],
    "Transaction": ["Transfer-Ownership", "Transfer-Money"],
    "Business": ["Start-Org", "Merge-Org", "Declare-Bankruptcy", "End-Org"],
    "Conflict": ["Attack", "Demonstrate"],
    "Personnel": ["Start-Position", "End-Position", "Nominate", "Elect"],
    "Justice": ["Arrest-Jail", "Release-Parole", "Trial-Hearing", "Charge-Indict", "Sue", "Convict", "Sentence", "Fine", "Execute", "Extradite", "Acquit", "Pardon", "Appeal"],
    "Contact": ["Meet", "Phone-Write"],
    "ART (artifact)": ["User-Owner-Inventor-Manufacturer"],
    "GEN-AFF (Gen-affiliation)": ["Citizen-Resident-Religion-Ethnicity", "Org-Location"],
    "METONYMY": ['none'],
    "ORG-AFF (Org-affiliation)": ["Employment", "Founder", "Ownership", "Student-Alum", "Sports-Affiliation", "Investor-Shareholder", "Membership"],
    "PART-WHOLE": ["Artifact", "Geographical", "Subsidiary"],
    "PER-SOC (person-social)": ["Business", "Family", "Lasting-Personal"],
    "PHYS (physical)": ["Located", "Near"],
    "Coreference": ["Coref"],
    "Unk": ["Unk"],
    "Process": ["Process"],
    "State": ["Emotion", "Thought", "Characteristic"],
    "Action": ["Direct Speech Act", "Indirect Speech Act", "Action Verb"],
    "Casual Effect": ["Casual Effect"]
};

var menu2_menu3 = {
    "Be-Born": ["Trigger_Word", "Person", "Time", "Place"],
    "Marry": ["Trigger_Word", "Person", "Time", "Place"],
    "Divorce": ["Trigger_Word", "Person", "Time", "Place"],
    "Injure": ["Trigger_Word", "Agent", "Victim", "Instrument", "Time", "Place"],
    "Die": ["Trigger_Word", "Agent", "Victim", "Instrument", "Time", "Place"],
    "Transport": ["Trigger_Word", "Agent", "Transporter", "Artifact", "Vehicle", "Origin", "Destination", "Price", "Time"],
    "Transfer-Ownership": ["Trigger_Word", "Buyer", "Seller", "Beneficiary", "Artifact", "Price", "Time", "Place"],
    "Transfer-Money": ["Trigger_Word", "Giver", "Recipient", "Beneficiary", "Money", "Time", "Place"],
    "Start-Org": ["Trigger_Word", "Agent", "Org", "Time", "Place"],
    "Merge-Org": ["Trigger_Word", "Org", "Time", "Place"],
    "Declare-Bankruptcy": ["Trigger_Word", "Org", "Time", "Place"],
    "End-Org": ["Trigger_Word", "Org", "Time", "Place"],
    "Attack": ["Trigger_Word", "Attacker", "Target", "Instrument", "Time", "Place"],
    "Demonstrate": ["Trigger_Word", "Entity", "Time", "Place"],
    "Start-Position": ["Trigger_Word", "Person", "Entity", "Position", "Time", "Place"],
    "End-Position": ["Trigger_Word", "Person", "Entity", "Position", "Time", "Place"],
    "Nominate": ["Trigger_Word", "Person", "Agent", "Position", "Time", "Place"],
    "Elect": ["Trigger_Word", "Person", "Entity", "Position", "Time", "Place"],
    "Arrest-Jail": ["Trigger_Word", "Person", "Agent", "Crime", "Time", "Duration", "Place"],
    "Release-Parole": ["Trigger_Word", "Person", "Entity", "Crime", "Time", "Place"],
    "Trial-Hearing": ["Trigger_Word", "Defendant", "Prosecutor", "Adjudicator", "Crime", "Time", "Place"],
    "Charge-Indict": ["Trigger_Word", "Defendant", "Prosecutor", "Adjudicator", "Crime", "Time", "Place"],
    "Sue": ["Trigger_Word", "Plaintiff", "Defendant", "Adjudicator", "Crime", "Time", "Place"],
    "Convict": ["Trigger_Word", "Defendant", "Adjudicator", "Crime", "Time", "Place"],
    "Sentence": ["Trigger_Word", "Sentence", "Defendant", "Adjudicator", "Crime", "Time", "Place"],
    "Fine": ["Trigger_Word", "Entity", "Adjudicator", "Money", "Crime", "Time", "Place"],
    "Execute": ["Trigger_Word", "Person", "Agent", "Crime", "Time", "Place"],
    "Extradite": ["Trigger_Word", "Agent", "Person", "Destination", "Origin", "Time", "Crime"],
    "Acquit": ["Trigger_Word", "Defendant", "Adjudicator", "Crime", "Time", "Place"],
    "Pardon": ["Trigger_Word", "Defendant", "Adjudicator", "Crime", "Time", "Place"],
    "Appeal": ["Trigger_Word", "Defendant", "Prosecutor", "Adjudicator", "Crime", "Time", "Place"],
    "Meet": ["Trigger_Word", "Entity", "Time", "Duration", "Place"],
    "Phone-Write": ["Trigger_Word", "Entity", "Time", "Duration", "Place"],
    "Relation_Args": ["Arg1", "Arg2"],
    "Process": ["Trigger_word", "Entity", "Time", "Place", "Agent", "Object"],
    "Emotion": ["Trigger_word", "Time", "Place", "Agent", "Emotion_Type", "Emotion"],
    "Thought": ["Trigger_word", "Topic", "Time", "Place", "Agent"],
    "Characteristic": ["Trigger_Word", "Entity", "Key", "Value", "Time", "Place"],
    "Casual Effect": ["Cause", "Effect"],
    "Direct Speech Act": ["Trigger_Word", "Addressee", "Speaker", "Msg (Direct)", "Time", "Place"],
    "Indirect Speech Act": ["Trigger_Word", "Addressee", "Speaker", "Topic (Indirect)", "Time", "Place"],
    "Action Verb": ["Trigger_Word", "Actor", "Direct Object", "Indirect Object", "Time", "Place"],
};

var rgb_dict = {
    "Entity": {
        "R": 153,
        "G": 102,
        "B": 255
    },
    "Relation": {
        "R": 255,
        "G": 80,
        "B": 80
    },
    "Event": {
        "R": 0,
        "G": 204,
        "B": 102
    }
}

var entity_rgb = {
    "Per": { "R": 0, "G": 102, "B": 153 },
    "Org": { "R": 51, "G": 51, "B": 255 },
    "Loc": { "R": 153, "G": 51, "B": 255 },
    "Fac": { "R": 204, "G": 0, "B": 204 },
    "Veh": { "R": 204, "G": 0, "B": 102 },
    "Wea": { "R": 204, "G": 102, "B": 0 },
    "Gpe": { "R": 255, "G": 51, "B": 0 },
    "Unk": { "R": 255, "G": 0, "B": 51 }
}

var relation_rgb = {
    "User-Owner-Inventor-Manufacturer": { "R": 0, "G": 102, "B": 153 },
    "Citizen-Resident-Religion-Ethnicity": { "R": 0, "G": 204, "B": 153 },
    "Org-Location": { "R": 0, "G": 153, "B": 51 },
    "none": { "R": 102, "G": 153, "B": 0 },
    "Employment": { "R": 204, "G": 204, "B": 0 },
    "Founder": { "R": 255, "G": 153, "B": 0 },
    "Ownership": { "R": 255, "G": 51, "B": 0 },
    "Student-Alum": { "R": 204, "G": 0, "B": 102 },
    "Sports-Affiliation": { "R": 204, "G": 51, "B": 153 },
    "Investor-Shareholder": { "R": 204, "G": 0, "B": 204 },
    "Membership": { "R": 153, "G": 51, "B": 255 },
    "Artifact": { "R": 51, "G": 51, "B": 204 },
    "Geographical": { "R": 0, "G": 102, "B": 204 },
    "Subsidiary": { "R": 51, "G": 204, "B": 204 },
    "Business": { "R": 0, "G": 255, "B": 153 },
    "Family": { "R": 51, "G": 204, "B": 51 },
    "Lasting-Personal": { "R": 153, "G": 255, "B": 51 },
    "Located": { "R": 255, "G": 255, "B": 0 },
    "Near": { "R": 255, "G": 153, "B": 51 },
    "Coref": { "R": 255, "G": 80, "B": 80 },
    "Unk": { "R": 255, "G": 0, "B": 51 },
    "Casual Effect": { "R": 132, "G": 200, "B": 174 }
}

var event_rgb = {
    "Be-Born": { "R": 0, "G": 102, "B": 153 },
    "Marry": { "R": 0, "G": 204, "B": 153 },
    "Divorce": { "R": 0, "G": 153, "B": 51 },
    "Injure": { "R": 102, "G": 153, "B": 0 },
    "Die": { "R": 204, "G": 204, "B": 0 },
    "Transport": { "R": 255, "G": 153, "B": 0 },
    "Transfer-Ownership": { "R": 255, "G": 51, "B": 0 },
    "Transfer-Money": { "R": 204, "G": 0, "B": 102 },
    "Start-Org": { "R": 204, "G": 51, "B": 153 },
    "Merge-Org": { "R": 204, "G": 0, "B": 204 },
    "Declare-Bankruptcy": { "R": 153, "G": 51, "B": 255 },
    "End-Org": { "R": 51, "G": 51, "B": 204 },
    "Attack": { "R": 0, "G": 102, "B": 204 },
    "Demonstrate": { "R": 51, "G": 204, "B": 204 },
    "Start-Position": { "R": 0, "G": 255, "B": 153 },
    "End-Position": { "R": 51, "G": 204, "B": 51 },
    "Nominate": { "R": 153, "G": 255, "B": 51 },
    "Elect": { "R": 255, "G": 255, "B": 0 },
    "Arrest-Jail": { "R": 255, "G": 153, "B": 51 },
    "Release-Parole": { "R": 255, "G": 80, "B": 80 },
    "Trial-Hearing": { "R": 255, "G": 51, "B": 153 },
    "Charge-Indict": { "R": 255, "G": 0, "B": 255 },
    "Sue": { "R": 153, "G": 102, "B": 255 },
    "Convict": { "R": 51, "G": 102, "B": 255 },
    "Sentence": { "R": 0, "G": 153, "B": 255 },
    "Fine": { "R": 0, "G": 255, "B": 255 },
    "Execute": { "R": 102, "G": 255, "B": 153 },
    "Extradite": { "R": 204, "G": 255, "B": 153 },
    "Acquit": { "R": 255, "G": 204, "B": 153 },
    "Pardon": { "R": 255, "G": 153, "B": 204 },
    "Appeal": { "R": 204, "G": 153, "B": 255 },
    "Meet": { "R": 153, "G": 204, "B": 255 },
    "Phone-Write": { "R": 102, "G": 204, "B": 255 },
    "Process": { "R": 96, "G": 92, "B": 132 },
    "Emotion": { "R": 28, "G": 194, "B": 85 },
    "Thought": { "R": 209, "G": 202, "B": 3 },
    "Characteristic":{ "R": 214, "G": 197, "B": 92 },
    "Direct Speech Act":{ "R": 125, "G": 221, "B": 0 },
    "Indirect Speech Act":{ "R": 142, "G": 179, "B": 29 },
    "Action Verb":{ "R": 231, "G": 187, "B": 64 },
}

var new_rgb_dict = {
    "Entity": entity_rgb,
    "Relation": relation_rgb,
    "Event": event_rgb
}

var selected_opacity = 0.8;
var unselected_opacity = 0.3;