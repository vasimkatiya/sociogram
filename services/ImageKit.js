const ImageKit = require('@imagekit/nodejs');

const client = new ImageKit({
    privateKey: "private_Y4czbRp1f62gyrapdc54ZpH5TnY=",
    publicKey:"public_bWb/JpRLe9Nq29ytA80XkHKuJT0=",
    urlEndpoint:"https://ik.imagekit.io/pba1fz17w"
    
});

exports.uploadFiles = async (file) =>{
    const result = await client.upload({
        file,
        fileName:"posts" + Date.now(),
    });

    return result;
}