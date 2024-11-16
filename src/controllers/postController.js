import postService from  "../services/postService";
import path from "path";
import {storages} from '../server';
let GetAllPost = async(req,res) => {

    let userId = req.body.Iduser;
    console.log(userId);
    let postData = await postService.GetAllPost(userId);
    //console.log(postData);
    return res.status(200).json({
        errCode: postData.errCode,
        message: postData.errMessage,
        post: postData.data ? postData.data : {}
    })
}

let GetPostwithid = async (req,res) => {
    let Idpost = req.body.Id;
    if(!Idpost){
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter !'
        })
    }
    let PostData = await postService.GetpostwithId(Idpost);
    return res.status(200).json({
        errCode: PostData.errCode,
        message: PostData.errMessage,
        post: PostData.data
    })
}
let GetPostwithiduser = async (req,res) => {
    let Iduser = req.body.iduser;
    if(!Iduser) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter !'
        })
    }
    let PostData = await postService.GetAllpostofowner(Iduser);
    return res.status(200).json({
        errCode: PostData.errCode,
        message: PostData.errMessage,
        post: PostData.data
    })
}
let uploadFile = async (file) => {
    try {
        // Tạo tên file mới bằng cách thêm timestamp
        const timestamp = Date.now();
        const originalName = path.basename(file.originalname);
        const newFileName = `${timestamp}-${originalName}`;
        const bucket = storages.bucket(process.env.BUCKET_NAME);
        
        // Tạo một file trong bucket
        const blob = bucket.file(newFileName);
        const blobStream = blob.createWriteStream({
            resumable: false,
            predefinedAcl: 'publicRead'  // Cấp quyền công khai cho file
        });

        // Xử lý các sự kiện của blobStream
        return new Promise((resolve, reject) => {
            blobStream.on('error', (err) => {
                console.log(err);
                reject(err);
            });

            blobStream.on('finish', () => {
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                resolve(publicUrl);
            });

            // Ghi dữ liệu buffer vào stream
            blobStream.end(file.buffer);
        });
    } catch (e) {
        console.log(e);
        throw e; // Ném lỗi lên để xử lý
    }
};
let Createpost = async (req, res) => {
    let jsonData;
    try {
        jsonData = JSON.parse(req.body.data || '{}');
    } catch (parseError) {
        return res.status(400).json({
            errCode: 1,
            message: 'Invalid JSON data!'
        });
    }

    const { iduser: Iduser, description: Description, namemusicvideo } = jsonData;
    const file = req.file;
    let Path = "";
    // Kiểm tra các thông tin bắt buộc
    if (!file || Iduser === "" || Description === "") {
        return res.status(400).json({
            errCode: 1,
            message: 'Missing or empty inputs parameter! Please provide valid values.'
        });
    }

    try {
        const fileUrl = await uploadFile(file); // Upload file và nhận lại URL
        Path = fileUrl;
    } catch (uploadError) {
        return res.status(500).json({
            errCode: 1,
            message: "Upload failed.",
        });
    }

    // Lưu post vào cơ sở dữ liệu
    let Postdata = await postService.Createnewpost(Iduser, Description, Path, namemusicvideo);
    return res.status(200).json({
        errCode: Postdata.errCode,
        message: Postdata.errMessage,
        post: Postdata.data
    });
};

let Removepost = async (req,res) => {
    let idpost = req.body.idpost;
    if(!idpost) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter !'
        })
    }
    let data = await postService.RemovePost(idpost);
    return res.status(200).json({
        errCode: data.errCode,
        message: data.errMessage,
    });
}
let Updatepost = async (req,res) => {
    let idpost = req.body.idpost;
    let namemusic = req.body.namemusicvideo;
    let description = req.body.description;
    console.log("result: ",idpost," ",namemusic," ",description);
    if(!idpost || !namemusic || !description){
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter !'
        })
    }
    let data = await postService.Updatepostuser(idpost,namemusic,description);
    return res.status(200).json({
        errCode: data.errCode,
        message: data.errMessage
    })
}
module.exports = {
    GetAllPost : GetAllPost,
    GetPosthasid : GetPostwithid,
    GetAllPostswithOwner:GetPostwithiduser,
    Createnewpost : Createpost,
    HandleRemovepost: Removepost,
    HandleUpdatepost: Updatepost
}