const ImageKit = require('@imagekit/nodejs');

const client = new ImageKit({
    privateKey: "private_Y4czbRp1f62gyrapdc54ZpH5TnY="
});

exports.uploadFiles = async (file) =>{
    const result = await client.files.upload({
        file,
        fileName:"posts" + Date.now(),
    });

    return result;
}