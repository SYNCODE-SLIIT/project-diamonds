import React from 'react'
import card1 from "../../assets/images/card1.jpeg"
import {LuTrendingUpDown} from "react-icons/lu"

const AuthLayout = ({children}) => {
  return (
    <div className='flex'>
        <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12">
            <h2 className="text-lg font-medium Otext-black">Expense Tracker</h2>
            {children}
        </div >

        <div className='hidden md:block w-[40vw] h-screen bg-violet-50 bg-auth-bg-img bg-cover bg-no-repeat'>
            <div className='w-48 h-48 rounded-[40px] bg-purple-600 absolute -top-7 -right-5'></div>
            <div className='w-48 h-56 rounded-[40px] border-[20px] border-fuchsia-600 absolute top-[30%] -right-1'></div>
            <div className='w-48 h-48 rounded-[40px]  bg-violet-500 absolute bottom-7 -right-1'></div>

            <div className="grid grid-cols-1 z-20">
                <StatsInfoCard
                    icon={<LuTrendingUpDown />}
                    label="Track Your Incone & Expenses"
                    value="430,000"
                    color="bg-primary"
                    />
            </div>    

            <img
                src={card1}
                className='w-64 lg:w-[90] absolute bottom-10 shadow-lg shadow-blue-400/25'
            />    
        </div>
    </div>
  )
}

export default AuthLayout;

const StatsInfoCard = ({icon, label, value, color}) =>{
    return <div className='flex gap-6 bg-white p-4 rounded-xl shadow-md shadow-purple-500'>
    <div className='w-12 h-12 flex itens-center justify-center text-[26px] text-whi'>{icon}</div>
    <div>
        <h6 className="">{label}</h6>
        <span className="">${value}</span>
    </div> 
   </div> 
}
 
        