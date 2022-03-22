import { injectable } from "tsyringe";
import { User } from "../schemas/User"

interface CreateUserDTO {
    email: string;
    socketId: string;
    avatar: string;
    name: string;
}

@injectable()
class CreateUserService {
    async execute({ email, socketId, avatar, name }: CreateUserDTO) {
        const userAlreadyExists = await User.findOne({ email }).exec();

        if (userAlreadyExists) {
            const { _id } = userAlreadyExists;
            let user: User = await User.findOneAndUpdate({ _id }, {
                socketId, avatar, name
            }, {
                new: true
            });
            return user;
        } else {
            const user: User = await User.create({
                email, socketId, avatar, name
            });
            return user;
        }
    }
}

export { CreateUserService }