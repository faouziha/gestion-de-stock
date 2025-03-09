import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className='mt-30 w-250 mx-auto  text-center'>
            <div >
                <h1 className='text-5xl font-bold'>Grow your business with our inventory management system</h1>
                <h3 className='mt-10 text-2xl'>Increase your sales and keep track of every unit with our powerful stock management, order fulfillment, and inventory control software.</h3>
            </div>
            <div className='mt-10'>
                <Link to={"/Signup"} className='border border-white w-60 py-2 font-bold hover:text-black hover:bg-white transition-colors mr-5 inline-flex justify-center'>Sign up</Link>
                <Link to={"/Contact"} className='border border-white w-60 py-2 font-bold hover:text-black bg-white hover:bg-transparent transition-colors inline-flex justify-center'>Contact Us</Link>

            </div>
            
        </div>
    );
}

export default Home;
