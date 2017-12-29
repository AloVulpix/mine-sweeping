/*
    type: 
        -1 雷
        其他数字 雷的数目
        0 空
    status:
        1 没点开
        2 插旗
        3 点开
    
*/
class Area{
    constructor(row, column, isMine) {
        if (isMine){
            this.type = -1
        } else {
            this.type = initNumber(row, column)
        }
        this.status = 1
        this.id = `r${row}c${column}`
    }
}

const OUTER_ID = '#border'
const SCORE_ID = '#score'
const RESULT_ID = '#result'
const ROW = 9
const COLUMN = 9
const MINE_COUNT = 10
const AREA_ARRAY = []
const MINE_POSITION = {}
let ifFinish = false

// 初始化相关内容
// TO DO 大小等其他参数
function init() {
    // 阻止右键默认事件
    document.oncontextmenu = function(e){
        e.preventDefault();
    };

    let outer = document.querySelector(OUTER_ID)
    // outer.setAttribute('style', 'width:')
}

// 初始化雷们
function initAreas() {
    for(let i = 0; i < ROW; i++) {
        for(let j = 0; j < COLUMN; j++) {
            if (MINE_POSITION[i.toString() + j.toString()]) {
                AREA_ARRAY.push(new Area(i, j, true))    
            } else {
                AREA_ARRAY.push(new Area(i, j, false))
            }
        }
    }
}

// 随机生成雷的位置
function initMinePosition() {
    while(Object.keys(MINE_POSITION).length < MINE_COUNT) {
        const row = Math.floor(Math.random() * ROW)
        const col = Math.floor(Math.random() * COLUMN)
        const key = row.toString() + col.toString()
        MINE_POSITION[key] = true
    }
}

// 显示某个区域
function showArea(area) {
    //修改该节点的内容
    modifyNode(3, area)

    // 如果当前节点是0，那么显示相邻的0和1节点
    if (area.type == 0) {
        const index = AREA_ARRAY.indexOf(area)
        showNeighbor(index - ROW)
        showNeighbor(index + ROW)
        if (index % COLUMN == 0 ) {
            showNeighbor(index - ROW + 1)
            showNeighbor(index + 1)
            showNeighbor(index + ROW + 1)
        } else if ((index + 1) % COLUMN == 0) {
            showNeighbor(index - 1)
            showNeighbor(index - ROW - 1)
            showNeighbor(index + ROW - 1)
        } else {
            showNeighbor(index - ROW + 1)
            showNeighbor(index + 1)
            showNeighbor(index + ROW + 1)
            showNeighbor(index - 1)
            showNeighbor(index - ROW - 1)
            showNeighbor(index + ROW - 1)
        }
    }

    function showNeighbor(indexTmp) {
        const areaTmp = AREA_ARRAY[indexTmp]
        if (validate(indexTmp) && areaTmp.status == 1 && (areaTmp.type != -1)) {
            areaTmp.status = 3
            showArea(areaTmp)
        }
    }
}

// 判断是不是输了
function judgeIfDie(type) {
    if (type == -1) {
        // 输了
        ifFinish = true
        setResult(1)

        // 标出雷在哪里，以及哪里标错了
        for(let i = 0; i < AREA_ARRAY.length; i++) {
            const area = AREA_ARRAY[i]
            if (area.type == -1) {
                modifyNode(3, area)
            }

            if (area.status == 2 && area.type != -1) {
                modifyNode(4, area)
            }
        }
    }
}

// 添加点击的事件
function addEvent(node, area) {
    node.addEventListener('mousedown', (ev) => {
        if (ifFinish) return
        const dom = document.querySelector(`#${area.id}`)
        const type = ev.buttons
        if (type == 1) {
            // 左键
            if (area.status == 1) {
                judgeIfDie(area.type)
                area.status = 3
                showArea(area)
            }
        } else if (type == 2) {
            //右键
            if (area.status == 3) return
            // 取消插旗
            if (area.status == 2) {
                area.status = 1
                modifyNode(2, area)
                modifyScore(2)
            } else {
                // 插旗子
                area.status = 2
                modifyNode(1, area)
                modifyScore(1)
            }
        } else if (type == 3) {
            // 同时按下
            const row = area.id[1]
            const col = area.id[3]
            const rArray = []
            const cArray = []
            findNeighbor(row, col, rArray, cArray)

            let QiCount = 0
            
            rArray.map((rVal) => {
                cArray.map((cVal) => {
                    if (document.querySelector(`#r${rVal}c${cVal}`).innerHTML == '旗') {
                        QiCount++
                    }
                })
            })

            if (QiCount == Number(node.innerHTML)) {
                const index = AREA_ARRAY.indexOf(area)
                showNeighbor(index - ROW)
                showNeighbor(index + ROW)
                if (index % COLUMN == 0 ) {
                    showNeighbor(index - ROW + 1)
                    showNeighbor(index + 1)
                    showNeighbor(index + ROW + 1)
                } else if ((index + 1) % COLUMN == 0) {
                    showNeighbor(index - 1)
                    showNeighbor(index - ROW - 1)
                    showNeighbor(index + ROW - 1)
                } else {
                    showNeighbor(index - ROW + 1)
                    showNeighbor(index + 1)
                    showNeighbor(index + ROW + 1)
                    showNeighbor(index - 1)
                    showNeighbor(index - ROW - 1)
                    showNeighbor(index + ROW - 1)
                }
            }

            function showNeighbor(indexTmp) {
                const areaTmp = AREA_ARRAY[indexTmp]
                if (validate(indexTmp) && areaTmp.status == 1) {
                    areaTmp.status = 3
                    modifyNode(3, areaTmp)
                    if (areaTmp.type == -1) {
                        ifFinish = true
                    }
                }
            }
        }

        // 判断赢了没有
        if (ifWin()) {
            ifFinish = true

            setResult(2)
        }
    })
}

// 画图
function draw() {
    const outer = document.querySelector(OUTER_ID)
    for(let i = 0; i < AREA_ARRAY.length; i++) {
        let node = document.createElement('p'),
            area = AREA_ARRAY[i]

        node.setAttribute('id', area.id)
        node.setAttribute('class', 'area')
        node.innerHTML = '</br>'
        addEvent(node, area)
        outer.appendChild(node)
    }
}

// 修改节点内容
/*type:
    1 插旗子
    2 取消旗子
    3 点开
    4 插旗子插错了
*/
function modifyNode(type, area) {
    const dom = document.querySelector(`#${area.id}`)
    switch(type) {
        case 1: 
                dom.innerHTML = '旗'
                break;
        case 2: 
                dom.innerHTML = '</br>'
                break;
        case 3: 
                if(area.type == -1) {
                    dom.setAttribute('class', 'area mine')
                    dom.innerHTML = '*'
                } else {
                    dom.setAttribute('class', 'area')
                    dom.innerHTML = area.type
                }
                break;
        case 4: dom.innerHTML = '错啦'
                break;
        default: break;
    }
}

/*
    修改剩余雷的数量
    type:
        1 雷-1
        2 雷+1
*/
function modifyScore(type) {
    let dom = document.querySelector(SCORE_ID)
    if (type == 1) {
        dom.innerHTML = Number(dom.innerHTML) - 1
    } else {
        dom.innerHTML = Number(dom.innerHTML) + 1
    }
}

// 计算当前区域雷的数量
function initNumber(row, col) {
    let count = 0
    const rArray = []
    const cArray = []

    findNeighbor(row, col, rArray, cArray)

    rArray.map((rVal) => {
        cArray.map((cVal) => {
            if (MINE_POSITION[rVal.toString() + cVal.toString()]) {
                count++
            }
        })
    })

    return count
}

// 找某个节点相邻的其他节点的坐标
function findNeighbor(row, col, rArray, cArray) {
    row = Number(row)
    col = Number(col)
    // 当前区域的四周合理的格子
    if(row == 0) {
        rArray.push(0)
        rArray.push(1)
    } else if (row == ROW-1) {
        rArray.push(7)
        rArray.push(8)
    } else {
        rArray.push(row - 1)
        rArray.push(row)
        rArray.push(row + 1)
    }

    if (col == 0) {
        cArray.push(0)
        cArray.push(1)
    } else if (col == COLUMN-1) {
        cArray.push(7)
        cArray.push(8)
    } else {
        cArray.push(col - 1)
        cArray.push(col)
        cArray.push(col + 1)
    }
}

// 验证某row/column的序号是不是合理的
function validate(index) {
    return index >= 0 && index < AREA_ARRAY.length
}

// 判断赢了没有
function ifWin(){
    let result = true
    AREA_ARRAY.map((val) => {
        if ((val.type == -1 && val.status != 2)||(val.type != -1 && val.status == 2)) {
            result = false
        }
    })
    return result
}

/* type:
    1 输啦
    2 赢啦
    3 清零重新开始
*/
function setResult(type) {
    let node = document.querySelector(RESULT_ID)
    if (type == 2) {
        node.innerHTML = '赢啦'
    } else if(type == 1) {
        node.innerHTML = '输啦啦'
    } else {
        node.innerHTML = 'inging'
    }
}

init()
initMinePosition()
initAreas()
draw()