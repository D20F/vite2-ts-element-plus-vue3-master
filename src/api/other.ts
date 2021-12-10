
import { getData, postData, deleteData, putData  } from '@/utils/axiosReq'
export const uploadImage = (reqData:any) => {
    const url = '/upload/images';
    const data = reqData;
    return postData(url, data);
}
/*
    上传文件
    params:{
    }
*/
export const uploadFile = (reqData) => {
    const url = '/upload/file';
    const data = reqData;
    return postData(url, data);
}