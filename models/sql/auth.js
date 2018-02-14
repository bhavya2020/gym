module.exports = (database, DataTypes) => {
    return database.define("auth", {
        id:DataTypes.STRING,
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        isTrainer:DataTypes.BOOLEAN,
        resetPasswordToken: DataTypes.STRING,
        resetPasswordExpires:DataTypes.STRING,
    })
};