import db from "../models/index";
import {Op,Sequelize} from "sequelize";
import followService from "./followService";
import LikepostService from "./likepostService";
import CommentService from "./commentService";
import UserService from "./userService";

let GetPostwithId = (Idpost) => {
    return new Promise(async (resolve, reject) => {
        try {
            let postData = {}
            let result = await db.Post.findOne({
                attributes: ['id','UserID','content','createdAt','updatedAt','hashtabvideo','Namemusicvideo','MediaURL'],
                include: [
                    {
                        model: db.User,
                        as: 'User',
                        attributes: ['id','email','firstName','lastName','fullName','avatar']
                    }
                ],
                where: {id:Idpost},
                raw: true
            })
            postData.errCode = 0;
            if(result){
                postData.errMessage = "OK"
                postData.data = {
                        id: result.id,
                        UserID: result.UserID,
                        content: result.content,
                        createdAt: result.createdAt,
                        updatedAt: result.updatedAt,
                        hashtabvideo: result.hashtabvideo,
                        Namemusicvideo: result.Namemusicvideo,
                        MediaURL: result.MediaURL,
                        UserId: result['User.id'], // Đổi tên thành UserId
                        UserEmail: result['User.email'], // Đổi tên thành UserEmail
                        UserFirstName: result['User.firstName'], // Đổi tên thành UserFirstName
                        UserLastName: result['User.lastName'], // Đổi tên thành UserLastName
                        UserFullName: result['User.fullName'], // Đổi tên thành UserFullName
                        UserAvatar: result['User.avatar'] // Đổi tên thành UserAvatar
                };
            }else{
                postData.errMessage = "Cannot fount Post with the ID";
                postData.data = {}
            }
            resolve(postData);
        } catch (e) {
            reject(e);
        }
    });
}

let Getallpostofowner = (idUser) => {
    return new Promise(async(resolve,reject) => {
        try{
            let postDatauserId = {};
            let posts = await db.Post.findAll({
                where: {UserID:idUser},
                order: [['createdAt', 'DESC']],
                raw: true
            });
            if(posts.length > 0){
                let allposts = [];
                for(const post of posts){
                    let countlike = await LikepostService.GetAllLikepost(post.id);
                    let countcomment = await CommentService.GetCountcomment(post.id);
                    let newpost = {
                        id: post.id,
                        urlvideo: post.MediaURL,
                        namemusic:post.Namemusicvideo,
                        totallike: countlike,
                        totalcomment: countcomment,
                        datecreated: post.createdAt,
                        dateupdated: post.updatedAt,
                        description: post.Content
                    }
                    allposts.push(newpost);
                }
                postDatauserId.errCode = 0;
                postDatauserId.errMessage = 'OK';
                postDatauserId.data = allposts;
            }
            else{
                postDatauserId.errCode = 1;
                postDatauserId.errMessage = 'Cannot found any posts !!!'
                postDatauserId.data = {}
            } 
            resolve(postDatauserId);
        }catch(e){
            reject(e);
        }
    })
}
let GetAllPost = (iduser) => {
    return new Promise(async(resolve,reject) => {
        try{
            let postData = {};
            
            const subqueryResult = await db.Post.findAll({
                attributes: [
                    [Sequelize.fn('MAX', Sequelize.col('id')), 'id']
                ],
                group: ['UserID'],
                raw: true
            });

            // Trích xuất các ID từ kết quả của subquery
            const postIds = subqueryResult.map(row => row.id);

            // Truy vấn chính để lấy chi tiết của post mới nhất cho mỗi user
            let post = await db.Post.findAll({
                where: {
                    id: {
                        [Op.in]: postIds
                    }
                },
                order: [['createdAt', 'DESC']],
                raw: true
            });
            postData.errCode = 0;
            postData.errMessage = 'OK';
            let allpost = [];
            if(post){
                for (const postofuser of post) {
                    let newdatapost = {
                        idpost: postofuser.id,
                        userID: postofuser.UserID,
                        content: postofuser.Content,
                        mediaURL: postofuser.MediaURL,
                        formatvideo: postofuser.Formatvideo,
                        hashtabvideo: postofuser.Hashtabvideo,
                        namemusicvideo: postofuser.Namemusicvideo
                    }


                    let likepost = await LikepostService.GetAllLikepost(newdatapost.idpost);
                    newdatapost.alllike = likepost;

                    let getuserlike = await LikepostService.GetAllIDuLikepost(newdatapost.idpost);
                    newdatapost.iduserlike = getuserlike;
                
                    let commentpost = await CommentService.GetCountcomment(newdatapost.idpost);
                    newdatapost.allcomment = commentpost;

                    let userinfo = await UserService.handleUserGetByID(newdatapost.userID);

                    newdatapost.userinfo = userinfo.data;
                    allpost.push(newdatapost);
                }
                if (iduser) {
                    allpost.sort((a, b) => {
                        if (a.userID === iduser && b.userID !== iduser) return -1;
                        if (a.userID !== iduser && b.userID === iduser) return 1;
                        return 0; // Giữ nguyên thứ tự (đã giảm dần theo Timestamp)
                    });
                }
                postData.data = allpost;
            }
            else postData.data = {};
            resolve(postData);
        }catch(e){
            reject(e);
        }
    });
}
let checkUserId = (idUser) => {
    return new Promise(async(resolve,reject) => {
        try{
            let user = await db.User.findOne({
                where: {id:idUser}
            })
            if(user) resolve(true);
            else {
                user = await db.Usergoogle.findOne({
                    where: {sub:idUser}
                });
                if(user) resolve(true);
                else resolve(false);
            }
        }catch(e){
            reject(e)
        }
    })
}
let CheckPost = (idpost) => {
    return new Promise(async(resolve,reject) => {
        try{
            let result = await db.Post.findOne({where :{id:idpost}});
            if(result){
                resolve(true);
            }else{ 
                resolve(false);
            }
        }catch(e){
            reject(e);
        }
    });
}



let Createpost = (iduser,description,path,namemusicvideo) => {
    return new Promise(async(resolve,reject) => {
        try {
            let postdata = {};
            let newpost = await db.Post.create({
                UserID: iduser,
                Content: description,
                MediaURL: path,
                Namemusicvideo: namemusicvideo
            })
            if(newpost) {
                postdata.errCode = 0;
                postdata.errMessage = "Create post success !!!";
                postdata.data = newpost;
            }else {
                postdata.errCode = 1;
                postdata.errMessage = "Create post faild, Please try again !!!";
                postdata.data = {};
            }
            resolve(postdata);
        }catch(e){
            reject(e);
        }
    })
}
let Updatepost = (idpost,namemusic,description) => {
    return new Promise(async(resolve,reject) => {
        try {
            let result = {};
            let post = await db.Post.findOne({
                where: {id:idpost}
            });
            if(post){
                const [updateRow] = await db.Post.update(
                    {
                        Content:description,
                        Namemusicvideo:namemusic
                    },
                    {
                        where:{id:idpost}
                    }
                )
                if(updateRow > 0){
                    result.errCode = 0;
                    result.errMessage = "post update success, Please check again !!!"
                }else {
                    result.errCode = 1;
                    result.errMessage = "post update failed, Please try again !!!"
                }
            }
            else {
                result.errCode = 2;
                result.errMessage = "Cannot find your post, Please try again !!!"
            }
            resolve(result);
        } catch (error) {
            reject(error);
        }
    })
}
let removepost = (idpost) => {
    return new Promise(async(resolve,reject) => {
        try {
            let result = {};
            let post = await db.Post.findOne({
                where: {id:idpost}
            });
            if(post){
                let Alllike = await db.Likepost.findAll({
                    where: {PostID: post.id},
                    raw: true
                })
                let Allcomment = await db.Comment.findAll({
                    where: {PostID: post.id},
                    raw: true
                });
                if(Alllike){
                    await db.Likepost.destroy({
                        where: { PostID: post.id }
                    });
                }
                if(Allcomment){
                    await db.Comment.destroy({
                        where: {PostID:post.id}
                    });
                }
                await db.Post.destroy({
                    where: {id: post.id}
                })
                result.errCode = 0;
                result.errMessage = "All information about the post has been successfully deleted, please check the results again !!!"
            }else{
                result.errCode = 1;
                result.errMessage = "Cannot found The post is chosen by you"
            }
            resolve(result);
        } catch(err){
            reject(err);
        }
    })
}
module.exports = {
    GetAllPost : GetAllPost,
    GetpostwithId: GetPostwithId,
    GetAllpostofowner: Getallpostofowner,
    Checkpost: CheckPost,
    Createnewpost: Createpost,
    RemovePost: removepost,
    Updatepostuser: Updatepost 
}