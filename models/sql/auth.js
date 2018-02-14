module.exports = (database, DataTypes) => {
    return database.define("auth", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        isTrainer:DataTypes.BOOLEAN,
        resetPasswordToken: DataTypes.STRING,
        resetPasswordExpires:DataTypes.STRING,
    })
};