import TestUser from "../models/testUser.model.js"
import TestOrder from "../models/testOrder.model.js";

const USER_ID = "6a5ba3143c165f83c30b6883"

export default class TestService 
{

    static async createUser() {
        try {
            const result = await TestUser.create({
                fullName: 'archana patel',
                email: "patelac2807@gmail.com",
                age: 28,
                password: "Password123"

            })
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async getAllUsers() {
        try {
            return await TestUser.find();
        } catch(error) {
            throw error
        }
        
    }

    static async getRahul() {
        try {
            return await TestUser.findOne({
                fullName: "Rahul"
            })
        } catch (error) {
            throw error;
        }

    }

    static async updateUser() {
        try {
            const result = await TestUser.updateOne(
                { fullName: 'archana patel' },
                {
                    $set: {
                        age: 30
                    }
                } 
            )
            return result;
            
        } catch (error) {
            throw error
        }
    }
    static async updateUser2() {
         try {
             const result = await TestUser.findOneAndUpdate(
                 { fullName: "archana patel" },
                 {
                     $set: {
                         age: 35
                     }
                 },
                 {new: true}
             );
             return result;
         } catch (error) {
             throw error;
         }
    }
    static async deleteUser() {
        try {
            const result = await TestUser.deleteOne(
                {
                    fullName: "archana patel"
                }
            );
            return result;
            
        } catch (error) {
            throw error;
        }
    }

    static async deleteUser2() {
        try {
            const result = await TestUser.findOneAndDelete(
                {fullName: "archana patel"}
            )
            return result;
            
        } catch (error) {
            throw error;
        }
    }
     
    static async findUserById() {
        try {
            const result = await TestUser.findById(USER_ID);
            return result;
            
        } catch (error) {
            throw error;
        }
    }

    static async findUserByIdAndUpdate() {
        try {
            const result = await TestUser.findByIdAndUpdate(
                USER_ID,
                {
                    $set: {
                        age: 70
                    }
                },
                {
                    new: true
                }
            )
            return result;
            
        } catch (error) {
            throw error;
        }
    }

    static async findUserByIdAndDelete() {
        try {
            const result = await TestUser.findByIdAndDelete(
                USER_ID
            )
            return result;
        } catch (error) {
            throw error;
        }
    }



    ///// ----------------------------/////


    static async createOrder() {
        try {
            const result = await TestOrder.create({
                product: "tea",
                price: 100,
                user: USER_ID
            })
            return result;
            
         } catch (error) {
             throw error;
         }
        
    }

    static async getOrders() {
        try {
            const result = await TestOrder.find({user: USER_ID});
            return result;
            
        } catch (error) {
            throw error;
        }
    }

    static async getOrdersWithUser() {
        try {
            //const result = await TestOrder.find().populate("user", "fullName");
             const result = await TestOrder.find({user: USER_ID}).populate("user", "-fullName");
            return result;
            
        } catch (error) {
            throw error;
        }
    }


  
}