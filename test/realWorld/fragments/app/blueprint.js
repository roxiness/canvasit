module.exports = {
    configs: ({ getConfig }) => ({
        packagejson: {
            "name": "my-app",
            "version": "1.0.0",
            "description": "",
            "author": "",
            "scripts": {
                "dev": "run-p dev:*"
            },
            "license": "ISC",
            "devDependencies":{
                "npm-run-all": "^4.1.5",
            }
        },
    }),
}