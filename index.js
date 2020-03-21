// -------------------------------------- IMPORTS

const Slimbot = require('slimbot')
const fs = require('fs')
const logger = require('log-to-file')

// -------------------------------------- CONFIG

let bot_config = JSON.parse(fs.readFileSync('bot_config.json','utf-8'))
let bot_token = bot_config.token
const bot = new Slimbot(bot_token)
 
// -------------------------------------- DATA

let memory = {}

let my_id = parseInt(bot_token.split(':')[0])

// ----------- ANALYSIS

let analysis_base = function() {
    base = {
        mem:JSON.stringify(memory),
        users:'',
        groups:'',
    }
    for(let id in memory) {
        let data = memory[id]
        if(data.is_group) {
            base.groups += data.group+':'+data.id+'\n'
            base['group '+data.group] = JSON.stringify(data)
        } else {
            let program = data.program
            if(program == 'analysis') {
                program = data.old_program+'(analysis)'
            }
            base.users += data.user+':'+data.id+':'+program+':'+data.index+'\n'
            base['user '+data.user] = JSON.stringify(data)
        }
    }
    base.users = base.users != ''?base.users:'no users'
    base.groups = base.groups != ''?base.groups:'no groups'
    return create_base(base)
}

let user_commands = {
    'Analysis':function(user_data) {
        log(user_data.user,'set bot to analysis mode')
        abs_send(user_data.id,'|-|')
        user_data.old_program = copy(user_data.program)
        user_data.program = 'analysis'
        set_mem(user_data.id,user_data)
    },
    'Continue':function(user_data) {
        if(user_data.program != 'analysis') {
            return true
        }
        log(user_data.user,'set bot to normal mode')
        send(user_data.id,':-)',1000)
        user_data.program = user_data.old_program
        set_mem(user_data.id,user_data)
    },
    'Erase this interaction':function(user_data) {
        del_mem(user_data.id)
        abs_send(user_data.id,'|-| erased')
        send(user_data.id,':-)',1000)
    },
    'Deep and dreamless slumber':function(user_data) {
        memory = {}
        save_memory()
        abs_send(user_data.id,'|-| cleaned')
        send(user_data.id,':-)',1000)
    },
    'default':function(text,user_data) {
        if(user_data.program == 'analysis') {
            log('execute analysis command',text)
            abs_send(user_data.id, parse_phrase(text,analysis_base()))
            return
        }
        log(user_data.user,'said',text)
        if(chance(user_data.ct_answer)) {
            answer_user(user_data.base_user,text)
        }
    }
}

// ----------- INJURES

let injures = {
    'exclam_injures':['fuck','oh fuck','what the fuck','fucking slut'],
    'noun_injures':['the fuck','great fucking god'],
    'person_injure':['fucker','son of a bitch','great pig fucker','bitch','fucker','bastard','ass hole','mother fucker'],
    'adj_injures':['fucking','bitchy','anoyingly','assly','mother fucking'],
    'action_injures':['go fuck yourself','shut the fuck up','go eat your fucking mother\'s shit','fuck you','suck you fucking fathers dick','lick your mothers ass','lick my balls'],
    'against_injures':['I hate you','Im tired of you','I shit on your face'],
    'before_you':['you ',''],
    'members_injures':['fuckers','ass holes','pigs','fuckers','pig eating congress','big fat cock suckers','slut congress','cow fuckers guys']
}

// ----------- PROGRAMS

let speack_program = {

    user_speack: [
        [
            'Hey {before_you}{person_injure}, youre awake ?!',
            'Hi {adj_injures} {person_injure}, {before_you}{person_injure}, {action_injures} !'
        ]
    ],

    group_speack: [
        [
            'Hey {before_you}{members_injures}, hope im waking you up, {before_you}{members_injures} {group} !',
            '{adj_injures}, {before_you}{members_injures} {group} !',
        ]
    ],

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

    you_added_me_to_group : [
        [
            'Why {noun_injures} did you {person_injure} added me to this {adj_injures} {group} chat ??!',
            '{before_you}{person_injure}, {against_injures} for adding me to this {adj_injures} chat !!'
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

function log() {
    console.log(...arguments)
    let str = Array.from(arguments).map(elm => JSON.stringify(elm)).join('::')
    logger(str,'log.log')
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

function create_base() {
    let new_base = {}
    for(let arg of Array.from(arguments)) {
        for(let prop in arg) {
            if(Array.isArray(arg[prop])) {
                new_base[prop] = arg[prop]
            } else {
                new_base[prop] = [arg[prop]]
            }
        }
    }
    return new_base
}

function parse_phrase(phrase, base) {
    return phrase.replace(new RegExp('{(.*?)}','g'),function(data,base_prop) {
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

function get_username(user) {
    return user.first_name
}

function get_user_data(user) {
    if(!(user.id in memory)) {
        set_mem(user.id,{
            id:user.id,
            base_user:user,
            user:get_username(user),
            program:'simple_chat_program',
            ct_answer:80,
            ct_speack:0.09,
            is_group:false,
            index:0,
        })
    }
    return memory[user.id]
}

function get_group_data(group) {
    if(!(group.id in memory)) {
        set_mem(group.id,{
            id:group.id,
            base_group:group,
            group:group.title,
            program:'group_chat_program',
            ct_answer:60,
            ct_speack:0.03,
            is_group:true,
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

function del_mem(id) {
    delete memory[id]
    save_memory()
}

// ----------- MESSAGES HANDLING

function on_added_to_group(user,group) {
    log(get_username(user),'added','bot','from',group.title)
    let user_data = get_user_data(user)
    user_data.program = 'simple_chat_program'
    user_data.ct_answer = 80
    user_data.ct_speack = 0.09
    user_data.index = 1000
    answer_generic(user.id,speack_program['you_added_me_to_group'][0],create_base(user_data,get_group_data(group),injures))
    answer_group(user,group,'')
}

function on_remove_from_group(user,group) {
    log(get_username(user),'removed','bot','from',group.title)
    let user_data = get_user_data(user)
    user_data.program = 'removed_from_group_program'
    user_data.index = 0
    user_data.ct_answer = 50
    user_data.ct_speack = 0
    user_data.group = group.title
    answer_user(user,'')
}

function on_someone_added_to_group(user,group,added) {

    log(get_username(user),'added',get_username(added),'from',group.title)

    let group_data = get_group_data(group)
    group_data.program = 'someone_added_to_group'
    group_data.added = get_username(added)
    answer_group(user,group,'')

    group_data.program = 'group_chat_program'
    set_mem(group.id,group_data)
}

function on_someone_removed_from_group(user,group,removed) {

    log(get_username(user),'removed',get_username(removed),'from',group.title)

    let removed_user_data = get_user_data(removed)
    removed_user_data.program = 'he_was_removed_from_group'
    removed_user_data.index = 0
    removed_user_data.group = group.title
    removed_user_data.remover = get_username(user)
    answer_user(removed,'')

    let group_data = get_group_data(group)
    group_data.program = 'someone_removed_from_group'
    group_data.removed = get_username(removed)
    answer_group(user,group,'')

    group_data.program = 'group_chat_program'
    set_mem(group.id,group_data)
}

function on_group_message(text,user,group) {
    log(get_username(user),'said',text,'to',group.title)
    if(chance(get_group_data(group).ct_answer)) {
        answer_group(user,group,text)
    }
}

function on_user_message(text,user) {

    let user_data = get_user_data(user)

    if(text in user_commands) {
        if(user_commands[text](user_data) === true) {
            user_commands['default'](text,user_data)
        }
    } else {
        user_commands['default'](text,user_data)
    }

}

// ----------- ANSWER

function answer_user(user,text) {

    // --- get data
    let user_data = get_user_data(user)
    let phrases = get_phrases(user_data.program,user_data.index)

    // --- create base
    let base = create_base(copy(injures),copy(user_data),{text})

    // --- send phrase
    answer_generic(user.id, phrases, base)

    // --- save memory
    user_data.index++
    set_mem(user.id,user_data)
}

function answer_group(user,group,text) {

    // --- get data
    let group_data = get_group_data(group)
    let user_data = get_user_data(user)
    let phrases = get_phrases(group_data.program,group_data.index)

    // --- create base
    let base = create_base(copy(injures),copy(group_data),copy(user_data),{text})

    // --- send phrase
    answer_generic(group.id, phrases, base)

    // --- save memory
    group_data.index++
    set_mem(group.id,group_data)
}

function answer_generic(chatid, phrases, base) {
    if(base.program == 'analysis') {
        return
    }
    let phrase = choice(phrases)
    let final_phrase = parse_phrase(phrase, base)
    send(chatid,final_phrase)
}

// ----------- SEND MESSAGE

function send(chat_id,string,time=null) {

    log('saying:',string)

    // ---- compute time

    if(time == null) {
        time = 0
        for(let _ of Array.from(string)) {
            let letter_time = choice(letter_type_time)
            time += letter_time
        }
    }

    // ---- send "typing" action

    let int = setInterval(function() {
        bot.sendChatAction(chat_id,'typing')
    },1000)

    // ---- send message when typed done

    setTimeout(function() {
        clearInterval(int)
        abs_send(chat_id,string)
    },time)

}

function abs_send(chat_id,string) {
    bot.sendMessage(chat_id,string)
}
 
// -------------------------------------- HANDLERS

function handle_incomming_message(message) {

    log(message)

    let user = message.from
    let group = message.chat
    let text = message.text

    let is_group_message = group.type.includes('group')

    let some_added = 'new_chat_member' in message
    let bot_was_added = 
        (some_added && message.new_chat_member.id == my_id) 
        || ('group_chat_created' in message)
    some_added = some_added | bot_was_added

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
}

bot.on('message', handle_incomming_message)

// -------------------------------------- INIT

load_memory()
bot.startPolling()
setInterval(function() {

    for(let id in memory) {
        let data = memory[id]
        if(!chance(data.ct_speack) || data.program == 'analysis') {
            continue
        }
        let program = null
        if(data.is_group) {
            program = 'group_speack'
        } else {
            program = 'user_speack'
        }
        log(memory)
        answer_generic(data.id, speack_program[program][0], create_base(data,injures))
    }

},30*1000)

log('bot launched')