let eventBus = new Vue()

Vue.component('main-list', {
    template: `
    <div>
        <create-task></create-task>
        <columns></columns>
    </div>
    `
})

Vue.component('columns', {

    template: `
        <div class="glob-list">
            <column class="column" :colIndex="colIndex1" :name="name" :col="columns[0]" @changeTask="changeTask" @toNextTask="toNextTask" @delTask="delTask"></column>
            <column class="column" :colIndex="colIndex2" :name="name2" :col="columns[1]" @changeTask="changeTask" @toNextTask="toNextTask"></column>
            <column class="column" :colIndex="colIndex3" :name="name3" :col="columns[2]" @changeTask="changeTask" @toNextTask="toNextTask" @backTask="backTask" @wantBackTask="wantBackTask" @insertReason="insertReason"></column>
            <column class="column" :colIndex="colIndex4" :name="name4" :col="columns[3]" @changeTask="changeTask"></column>
        </div>
    `,
    data() {
        return {
            temporalCol: [],
            columns: [
                [],
                [],
                [],
                [],
            ],

            name: 'Запланированные задачи',
            name2: 'Задачи в работе',
            name3: 'Тестирование',
            name4: 'Выполненные задачи',

            colIndex1: 0,
            colIndex2: 1,
            colIndex3: 2,
            colIndex4: 3,
        }
    },
    mounted() {
        // const saveCols = localStorage.getItem('columns')
        // if(saveCols){
        //     this.columns = JSON.parse(saveCols)
        // }

        eventBus.$on('review-submitted', taskReview => {
            console.log('puncts', taskReview)
            this.columns[0].push(taskReview)
            // this.saveCols()
        })
    },
    // watch:{
    //     columns: {
    //         handler: 'saveCols',
    //         deep: true
    //     }
    // },
    methods: {
        saveCols(){
            localStorage.setItem('columns', JSON.stringify(this.columns))
        },
        changeTask(task) {
            let movingTask = this.columns[task.colIndex][task.index]
            this.moveTask(movingTask, task)
        },
        delTask(task) {
            this.columns[task.colIndex].splice(task.index, 1)
        },
        toNextTask(task) {
            let move = this.columns[task.colIndex].splice(task.index, 1)
            this.columns[task.colIndex + 1].push(...move)
        },
        backTask(task) {
            let move = this.columns[task.colIndex].splice(task.index, 1)
            move[0].wantBack = false;
            console.log(move)
            this.columns[task.colIndex - 1].push(...move)
        },

        insertReason(task){
            console.log('resons task', task)
            let reasonTask = this.columns[task.colIndex][task.index]
            reasonTask.reasonsBack.push(task.reason)
        },
        wantBackTask(task){
            let backTask = this.columns[task.colIndex][task.index]
            backTask.wantBack = true;
            console.log(this.wantBack)
        },

        moveTask(movingTask, task){
            let move = this.columns[task.colIndex].splice(task.index, 1)
            this.columns[task.colIndex + 1].push(...move)
        }
    }
})

Vue.component('column', {
    props: {
        col: {
            type: Array,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        colIndex: {
            type: Number,
            required: true
        },
    },
    template: `
        <div>
            <h3>{{name}}</h3>
            <p>
               <div>
                <p v-if="!col.length">Нет тасков</p>
                
                  <ul>
                    <li
                    v-for="(pun, index) in col" 
                    class="taskBorder"
                    :key="pun.id"
                    >
                        <h3>{{pun.name}}</h3>
                        <p>{{pun.description}}</p><br>
                        <p>Дедлайн:</p><p>{{pun.deadline}}</p>
                        <p>Дата создания:</p><p>{{pun.dateStart}}</p>

                        <input v-show="colIndex===0"  type="button" @click="delTask(index, colIndex)" value="Удалить">
                        <input v-show="colIndex!==3"  type="button" @click="toNextTask(index, colIndex)" value="Далее">
                        <input v-show="colIndex===2 && !pun.wantBack"  type="button" @click="wantBackTask(index, colIndex)" value="Вернуть"><br>
                        <input v-show="colIndex!==3"  type="button" @click="changeTask(index, colIndex)" value="Редактировать">
                        
                        <ul v-if="pun.reasonsBack!==[]">
                            <p>Причины возврата</p>
                            <li v-for="el of pun.reasonsBack">
                                {{el}}
                            </li>
                        </ul>
                        
                        <div v-if="colIndex===2 && pun.wantBack">
                            <form @submit.prevent="onSubmit">
                                <label for="reason">Причина возврата:</label>
                                <input id="reason" type="text" v-model="reason" placeholder="причина">
                                <input type="submit" value="Вернуть" name="reason" id="reason" @click="insertReason(index, colIndex, reason), backTask(index, colIndex)">
                            </form>
                        </div>
                    </li>
                </ul>
            </div>
           </p>
        </div>
    `,
    data() {
        return {
            count: null,
            strDate: null,
            reason: null,
        }
    },
    methods: {

        changeTask(index, colIndex) {
            console.log(this.strDate)
            this.$emit('changeTask', {index, colIndex})
        },
        delTask(index, colIndex){
            this.$emit('delTask', {index, colIndex})
        },
        toNextTask(index, colIndex){
            this.$emit('toNextTask', {index, colIndex})
        },
        backTask(index, colIndex){
            this.$emit('backTask', {index, colIndex})
        },
        wantBackTask(index, colIndex){
            this.$emit('wantBackTask', {index, colIndex})
        },

        insertReason(index, colIndex, reason){
            this.$emit('insertReason', {index, colIndex, reason})
            this.reason=null
        }
    }
})

Vue.component('create-task', {
    template: `
        <div>
            <form class="task-form" @submit.prevent="onSubmit">
            <div class="container">
                <h3 class="logo">Создать задачу</h3>
                <div class="punct">
                    <label for="name" class="form-p">Название:</label>
                    <input required id="name" v-model="name" type="text">
                </div><br>
                <div class="punct">
                    <label for="description" class="form-p">Описание задачи:</label>
                    <input id="description" v-model="description" type="text"></div>
                <div class="punct">
                    <label for="deadline" class="form-p">Дедлайн:</label>
                    <input id="deadline" v-model="deadline"  type="date"></div>
                <input type="submit" value="Добавить" class="btn">
            </div>
            </form>
        </div>
    `,
    data() {
        return {
            name: null,
            description: null,
            deadline: null,
            id: 1,
            countDone: 0,
            errors: 0,
            checkLength: [],
            dateStart:null
        }
    },
    methods: {
        onSubmit() {
            this.dateTask()
            let taskReview = {
                name: this.name,
                description: this.description,
                deadline: this.deadline,
                dateStart: this.dateStart,
                reasonsBack:[],
                wantBack: false,
                id: this.id,
            }
            // taskReview.puncts = this.removeEmptyValues(taskReview.puncts)
            this.idIncrease()
            eventBus.$emit('review-submitted', taskReview)
            this.name = null
            this.description = null
            this.deadline = null
            this.dateStart = null
        },
        idIncrease() {
            this.id++
        },
        clearCheckLength() {
            return this.checkLength = []
        },

        // removeEmptyValues(arr) {
        //
        //     arr = arr.filter(el => {
        //         if (el.punct !== null || '' || undefined) {
        //             return el.punct;
        //         }
        //
        //     })
        //     return arr
        // },
        dateTask(){
            let date = new Date()
            let year = date.getFullYear()
            let month = date.getMonth()+1
            let day = date.getDate()
            let time = date.toLocaleTimeString()
            let strDate = year+'-'+month+'-'+day+' , '+time
            this.dateStart = strDate
        }
    }
})

let app = new Vue({
    el: '#app',
    methods: {}
})