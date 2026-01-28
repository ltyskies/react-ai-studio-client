import {request} from '../utils'

export function createNewConversationAPI(userId: number){
    return request({
        url:'chat/conversation',
        method:'POST',
        data:{userId}
    })
}

export function getConversationDetailAPI(useId: number,id : number){
    return request({
        url:`chat/conversation?userId=${useId}&id=${id}`,
        method:'GET',
    })
}