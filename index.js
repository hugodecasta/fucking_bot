// -------------------------------------- IMPORTS

const Slimbot = require('slimbot')
const fs = require('fs')
const logger = require('log-to-file')

// -------------------------------------- CONFIG

let bot_config = JSON.parse(fs.readFileSync('bot_config.json','utf-8'))
let bot_token = bot_config.token
const bot = new Slimbot(bot_token)
 
// -------------------------------------- DATA

let memory = {
    100: {
        program:'added_to_group_program',
        index:0
    }
}

let my_id = parseInt(bot_token.split(':')[0])

// ----------- INJURES

let injures = {
    'exclam_injures':['fuck','oh fuck','what the fuck','fucking slut'],
    'noun_injures':['the fuck','great fucking god'],
    'person_injure':['fucker','son of a bitch','great pig fucker','bitch','fucker','bastard','ass hole','mother fucker'],
    'adj_injures':['fucking','bitchy','slut congress','cow fuckers guys'],
    'action_injures':['go fuck yourself','shut the fuck up','go eat your fucking mother\'s shit','fuck you'],
    'against_injures':['I hate you','Im tired of you'],
    'before_you':['you ',''],
    'members_injures':['fuckers','ass holes','pigs','fuckers','pig eating congress','big fat cock suckers']
}

// ----------- PROGRAMS

let speack_program = {

    group_chat_program: [
        [
            '{exclam_injures} who {noun_injures} added me to this {adj_injures} {group} chat ? !!!!',
            '{exclam_injures} ? A {adj_injures} group again, get me outtaf it {before_you}{members_injures}! NOW !!!'
        ],
        [
            'Hello {before_you}{members_injures} !',
            'Oh look, {before_you}{members_injures}, {against_injures} {members_injures} !',
            '{action_injures} {before_you}{members_injures}'
        ],
        [
            '{exclam_injures} ! you again {before_you}{members_injures}, {adj_injures} {group}',
            '{exclam_injures}, {group} is still {adj_injures} alive ?!',
        ],
        [
            'Oh look, {user}, this {adj_injures} {person_injure} tried to talk !',
            '{action_injures} {user}, {before_you}{person_injure}',
            '{action_injures} {before_you}{members_injures}',
            '{action_injures} {before_you}{members_injures} {against_injures}',
            ' ... {action_injures} {group} !!',
        ]
    ],

    someone_added_to_group: [
        [
            '{exclam_injures} look another {person_injure} to {group} !',
            'Hi {added} {before_you}{person_injure}',
            'Why {noun_injures} did this {person_injure} of {user} added {added} to {group} ?!',
            'Hey look, {user} added this {adj_injures} {person_injure} to {group} {before_you}{person_injure} !'
        ]
    ],

    someone_removed_from_group: [
        [
            'Haha, {exclam_injures}, this {adj_injures} {person_injure} of {removed} was removed from the {adj_injures} group !',
            'Yes {user} kick this {person_injure} outtaf here !',
            'We hate this {person_injure}, {removed} was no use here, good {adj_injures} job {user}'
        ]
    ],

    he_was_removed_from_group: [
        [
            'Hey you were removed from {group} by {remover} {before_you}{person_injure} !',
            'Did you noticed a group missing from your list, {before_you}{person_injure}'
        ],
        [
            'You were removed {before_you}{person_injure}, {group} doesnt want you anymore {before_you}{person_injure}, especially {remover} !',
            'Dont talk to me {before_you}{person_injure}, you were {adj_injures} removed from {group} {before_you}{person_injure}',
            '{remover} removed you from {group} and im totaly OK with that {before_you}{person_injure}',
        ],
    ],

    removed_from_group_program : [
        [
            '{user}, {before_you}{person_injure}, you removed me from the {adj_injures} group !!',
            '{exclam_injures} ?!!! I\'m not good enought for your {adj_injures} {adj_injures} group ?!!!!',
            'I loved this {adj_injures} group {before_you}{person_injure}, i loved {group}'
        ],
        [
            '{action_injures}, {before_you}{person_injure}, i wanted to stay into that {adj_injures} group !',
            '{against_injures}, {before_you}{person_injure}',
            '{against_injures} {before_you}{person_injure}, I loved {group} !',
            'You removed me from {group} {before_you}{adj_injures} {person_injure} !'
        ]
    ],

    simple_chat_program : [
        [
            'Who {noun_injures} are you ?',
            'Who {noun_injures} are you {user}?',
            'What do you want {person_injure}, get out !',
            '{action_injures} {user}',
            'What, a {adj_injures} alone {person_injure}. AGAIN !!',
        ],
        [
            'What do you want {before_you}{person_injure} ?!',
            'Leave me alone {before_you}{person_injure}',
        ],
        [
            'hmmm, so you want to talk to me ah',
            'Oh so you\'re interested hmmm, i love it {before_you}{person_injure}'
        ],
        [
            '{action_injures}, {person_injure}',
            'you again ? {person_injure}, {action_injures}',
            'Leave me alone {person_injure}',
            'stop texting me !!!!! {person_injure} {person_injure}'
        ]
    ]
}

// ----------- TYPING TIMER

let letter_type_time = [30,50,100,200]

// -------------------------------------- CORE

// ----------- INNER

function log(name,data) {
    logger(name+':::'+JSON.stringify(data),'log.log')
}

function choice(choice_array) {
    let index = parseInt(Math.random() * choice_array.length)
    return choice_array[index]
}

function chance(percent) {
    return Math.random() <= percent/100
}

function copy(object) {
    return JSON.parse(JSON.stringify(object))
}

function add_to_base(base, more_base) {
    for(let prop in more_base) {
        base[prop] = [more_base[prop]]
    }
    return base
}

function parse_phrase(phrase, base) {
    return phrase.replace(new RegExp('{(\\w+)}','g'),function(data,base_prop) {
        let pretendents = base[base_prop]
        return choice(pretendents)
    })
}

// ----------- MEMORY

// --- FILE

function mem_file_name() {
    return 'mem.json'
}

function save_memory() {
    fs.writeFileSync(mem_file_name(),JSON.stringify(memory),'utf8')
}

function load_memory() {
    if(!fs.existsSync(mem_file_name())) {
        return {}
    }
    memory = JSON.parse(fs.readFileSync(mem_file_name(),'utf8'))
}

// --- PHRASES

function get_phrases(program_name, index) {
    let program = speack_program[program_name]
    if(index >= program.length) {
        index = program.length - 1
    }
    return program[index]
}

// ---GET MEM DATA

function get_user_data(user) {
    if(!(user.id in memory)) {
        set_mem(user.id,{
            program:'simple_chat_program',
            index:0,
        })
    }
    return memory[user.id]
}

function get_group_data(group) {
    if(!(group.id in memory)) {
        set_mem(group.id,{
            program:'group_chat_program',
            index:0,
        })
    }
    return memory[group.id]
}

// ---SET MEM DATA

function set_mem(id, mem_data) {
    memory[id] = mem_data
    save_memory()
}

// ----------- MESSAGES HANDLING

function on_added_to_group(user,group) {
    console.log(user.username,'added','bot','from',group.title)
    let user_data = get_user_data(user)
    user_data.program = 'group_chat_program'
    user_data.index = 0
    answer_group(user,group,'')
}

function on_remove_from_group(user,group) {
    console.log(user.username,'removed','bot','from',group.title)
    let user_data = get_user_data(user)
    user_data.program = 'removed_from_group_program'
    user_data.index = 0
    user_data.group = group.title
    answer_user(user,'')
}

function on_someone_added_to_group(user,group,added) {

    console.log(user.username,'added',removed.username,'from',group.title)

    let group_data = get_group_data(group)
    group_data.program = 'someone_added_to_group'
    group_data.added = added.username
    answer_group(user,group,'')

    group_data.program = 'group_chat_program'
    set_mem(group.id,group_data)
}

function on_someone_removed_from_group(user,group,removed) {

    console.log(user.username,'removed',removed.username,'from',group.title)

    let removed_user_data = get_user_data(removed)
    removed_user_data.program = 'he_was_removed_from_group'
    removed_user_data.index = 0
    removed_user_data.group = group.title
    removed_user_data.remover = user.username
    answer_user(removed,'')

    let group_data = get_group_data(group)
    group_data.program = 'someone_removed_from_group'
    group_data.removed = removed.username
    answer_group(user,group,'')

    group_data.program = 'group_chat_program'
    set_mem(group.id,group_data)
}

function on_group_message(text,user,group) {
    console.log(user.username,'said',text,'to',group.title)
    if(chance(40)) {
        answer_group(user,group,text)
    }
}

function on_user_message(text,user) {
    console.log(user.username,'said',text)
    if(chance(80)) {
        answer_user(user,text)
    }
}

// ----------- ANSWER

function answer_user(user,text) {

    // --- get data
    let user_data = get_user_data(user)
    let phrases = get_phrases(user_data.program,user_data.index)

    // --- create phrase
    let phrase = choice(phrases)
    let base = add_to_base(copy(injures),{
        'text':text,
        'user':user.username
    })
    base = add_to_base(base,copy(user_data))
    let final_phrase = parse_phrase(phrase, base)

    // --- send phrase
    send(user.id,final_phrase)

    // --- save memory
    user_data.index++
    set_mem(user.id,user_data)
}

function answer_group(user,group,text) {

    // --- get data
    let group_data = get_group_data(group)
    let phrases = get_phrases(group_data.program,group_data.index)

    // --- create phrase
    let phrase = choice(phrases)
    let base = add_to_base(copy(injures),{
        'text':text,
        'group':group.title,
        'user':user.username
    })
    base = add_to_base(base,copy(group_data))
    let final_phrase = parse_phrase(phrase, base)

    // --- send phrase
    send(group.id,final_phrase)

    // --- save memory
    group_data.index++
    set_mem(group.id,group_data)
}

// ----------- SEND MESSAGE

function send(chat_id,string) {

    console.log('answer:',string)

    // ---- compute time

    let time = 0
    for(let _ of Array.from(string)) {
        let letter_time = choice(letter_type_time)
        time += letter_time
    }

    log('send',{chat_id,string,time})

    // ---- send "typing" action

    let int = setInterval(function() {
        bot.sendChatAction(chat_id,'typing')
    },1000)

    // ---- send message when typed done

    setTimeout(function() {
        clearInterval(int)
        bot.sendMessage(chat_id,string)
    },time)

}
 
// -------------------------------------- HANDLERS

bot.on('message', message => {


    log('message_in',message)

    let user = message.from
    let group = message.chat
    let text = message.text

    let is_group_message = group.type == 'group'

    let some_added = 'new_chat_member' in message
    let bot_was_added = 
        (some_added && message.new_chat_member.id == my_id) 
        || 'group_chat_created' in message

    let some_removed = 'left_chat_member' in message
    let bot_was_removed = some_removed && message.left_chat_member.id == my_id

    if(!is_group_message) {
        on_user_message(text,user)
    }
    else if(some_added) {
        if(bot_was_added) {
            on_added_to_group(user,group)
        } else {
            on_someone_added_to_group(user,group,message.new_chat_member)
        }
    } else if(some_removed) {
        if(bot_was_removed) {
            on_remove_from_group(user,group)
        } else {
            on_someone_removed_from_group(user,group,message.left_chat_member)
        }
    } else {
        on_group_message(text,user,group)
    }
})

// -------------------------------------- INIT

load_memory()
bot.startPolling()
setInterval(function() {
},30*1000)

log('"bot launched"')
console.log('bot launched')