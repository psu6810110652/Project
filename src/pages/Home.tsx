import React, { useCallback } from 'react';
import {useNavigate} from "react-router-dom";
// import styles from './Home.css';

const Home: React.FC = () => {
    const navigate = useNavigate();
    // const onContainerClick = useCallback(() => {
    // // Add your code here
    // }, []);

    // const onFrameContainerClick = useCallback(() => {
    // navigate("/");
    // }, [navigate]);

    return (
        <div className="w-[1920px] h-[3308px] relative bg-lime-100 overflow-hidden">
            <img className="w-[1922px] h-[757px] left-[-2px] top-[110px] absolute" src="https://placehold.co/1922x757" />
            <div className="w-[1922px] h-72 left-0 top-[337px] absolute bg-amber-50/50" />
            <div className="w-[1922px] h-40 left-0 top-[411px] absolute bg-amber-50/75" />
            <div className="left-[594px] top-[414px] absolute text-center justify-start text-green-800 text-8xl font-semibold font-['Prompt'] [text-shadow:_0px_4px_20px_rgb(0_0_0_/_0.25)]">ธีรยุทธการเกษตร</div>
            <div className="w-[1920px] h-[744px] left-0 top-[1862px] absolute bg-amber-50" />
            <div className="w-[1720px] h-96 left-[100px] top-[2108px] absolute overflow-hidden">
                <div className="w-80 h-96 left-[1519px] top-[1px] absolute">
                <div className="w-80 h-96 left-0 top-0 absolute">
                    <div className="w-80 h-96 left-0 top-0 absolute bg-amber-50 rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-72 h-72 left-[20.79px] top-[20.79px] absolute bg-white rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)] outline outline-2 outline-offset-[-1.88px] outline-green-800" />
                    <div className="w-72 h-6 left-[21.58px] top-[334.02px] absolute bg-green-800" />
                </div>
                <div data-size="48" className="w-6 h-6 left-[286.84px] top-[373.30px] absolute outline outline-1 outline-offset-[-0.94px] overflow-hidden">
                    <div className="w-5 h-5 left-[1.59px] top-[3.22px] absolute outline outline-4 outline-offset-[-1.88px] outline-green-800" />
                </div>
                <div className="left-[20.79px] top-[369.14px] absolute justify-start text-green-800 text-2xl font-semibold font-['Prompt']">มีจำนวน xx ชิ้น</div>
                </div>
                <div className="w-80 h-96 left-[1146px] top-0 absolute">
                <div className="w-80 h-96 left-0 top-0 absolute">
                    <div className="w-80 h-96 left-0 top-0 absolute bg-amber-50 rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-72 h-72 left-[20.79px] top-[20.79px] absolute bg-white rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)] outline outline-2 outline-offset-[-1.88px] outline-green-800" />
                    <div className="w-72 h-6 left-[21.58px] top-[334.02px] absolute bg-green-800" />
                </div>
                <div data-size="48" className="w-6 h-6 left-[286.84px] top-[373.30px] absolute outline outline-1 outline-offset-[-0.94px] overflow-hidden">
                    <div className="w-5 h-5 left-[1.59px] top-[3.22px] absolute outline outline-4 outline-offset-[-1.88px] outline-green-800" />
                </div>
                <div className="left-[20.79px] top-[369.14px] absolute justify-start text-green-800 text-2xl font-semibold font-['Prompt']">มีจำนวน xx ชิ้น</div>
                </div>
                <div className="w-80 h-96 left-[773px] top-[1px] absolute">
                <div className="w-80 h-96 left-0 top-0 absolute">
                    <div className="w-80 h-96 left-0 top-0 absolute bg-amber-50 rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-72 h-72 left-[20.79px] top-[20.79px] absolute bg-white rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)] outline outline-2 outline-offset-[-1.88px] outline-green-800" />
                    <div className="w-72 h-6 left-[21.58px] top-[334.02px] absolute bg-green-800" />
                </div>
                <div data-size="48" className="w-6 h-6 left-[286.84px] top-[373.30px] absolute outline outline-1 outline-offset-[-0.94px] overflow-hidden">
                    <div className="w-5 h-5 left-[1.59px] top-[3.22px] absolute outline outline-4 outline-offset-[-1.88px] outline-green-800" />
                </div>
                <div className="left-[20.79px] top-[369.14px] absolute justify-start text-green-800 text-2xl font-semibold font-['Prompt']">มีจำนวน xx ชิ้น</div>
                </div>
                <div className="w-80 h-96 left-[400px] top-0 absolute">
                <div className="w-80 h-96 left-0 top-0 absolute">
                    <div className="w-80 h-96 left-0 top-0 absolute bg-amber-50 rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-72 h-72 left-[20.79px] top-[20.79px] absolute bg-white rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)] outline outline-2 outline-offset-[-1.88px] outline-green-800" />
                    <div className="w-72 h-6 left-[21.58px] top-[334.02px] absolute bg-green-800" />
                </div>
                <div data-size="48" className="w-6 h-6 left-[286.84px] top-[373.30px] absolute outline outline-1 outline-offset-[-0.94px] overflow-hidden">
                    <div className="w-5 h-5 left-[1.59px] top-[3.22px] absolute outline outline-4 outline-offset-[-1.88px] outline-green-800" />
                </div>
                <div className="left-[20.79px] top-[369.14px] absolute justify-start text-green-800 text-2xl font-semibold font-['Prompt']">มีจำนวน xx ชิ้น</div>
                </div>
                <div className="w-80 h-96 left-[30px] top-[1px] absolute">
                <div className="w-80 h-96 left-0 top-0 absolute">
                    <div className="w-80 h-96 left-0 top-0 absolute bg-amber-50 rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-72 h-72 left-[20.79px] top-[20.79px] absolute bg-white rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)] outline outline-2 outline-offset-[-1.88px] outline-green-800" />
                    <div className="w-72 h-6 left-[21.58px] top-[334.02px] absolute bg-green-800" />
                </div>
                <div data-size="48" className="w-6 h-6 left-[286.84px] top-[373.30px] absolute outline outline-1 outline-offset-[-0.94px] overflow-hidden">
                    <div className="w-5 h-5 left-[1.59px] top-[3.22px] absolute outline outline-4 outline-offset-[-1.88px] outline-green-800" />
                </div>
                <div className="left-[20.79px] top-[369.14px] absolute justify-start text-green-800 text-2xl font-semibold font-['Prompt']">มีจำนวน xx ชิ้น</div>
                </div>
                <img className="w-56 h-80 left-[87px] top-[-8px] absolute" src="https://placehold.co/218x305" />
                <img className="w-44 h-64 left-[472px] top-[37px] absolute" src="https://placehold.co/182x263" />
                <img className="w-64 h-44 left-[800px] top-[91px] absolute" src="https://placehold.co/265x176" />
                <img className="w-32 h-64 left-[1251px] top-[35px] absolute" src="https://placehold.co/126x270" />
                <img className="w-36 h-60 left-[1610px] top-[48px] absolute" src="https://placehold.co/152x234" />
            </div>
            <div className="w-[1600px] h-0 left-[1760px] top-[2043px] absolute origin-top-left -rotate-180 outline outline-[5px] outline-offset-[-2.50px] outline-green-800"></div>
            <div className="left-[716px] top-[1895px] absolute text-center justify-start text-green-800 text-7xl font-semibold font-['Prompt'] [text-shadow:_0px_4px_20px_rgb(0_0_0_/_0.25)]">สินค้าโปรโมชั่น</div>
            <div data-property-1="Default" className="w-20 h-20 left-[1790px] top-[2286px] absolute">
                <div className="w-20 h-20 left-0 top-0 absolute bg-amber-50 rounded-full shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)]" />
                <div className="w-9 h-px left-[22px] top-[40px] absolute border-[5px] border-green-800" />
            </div>
            <div data-property-1="Default" className="w-20 h-20 left-[132px] top-[2369px] absolute origin-top-left -rotate-180">
                <div className="w-20 h-20 left-0 top-0 absolute bg-amber-50 rounded-full shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)]" />
                <div className="w-9 h-px left-[22px] top-[40px] absolute border-[5px] border-green-800" />
            </div>
            <div className="w-[786px] h-16 left-[569px] top-[914px] absolute bg-amber-50 rounded-[20px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)]" />
            <div className="w-16 h-16 left-[1273px] top-[914px] absolute overflow-hidden">
                <div className="w-12 h-12 left-[10px] top-[10px] absolute bg-green-800/95" />
            </div>
            <div className="left-[597px] top-[931px] absolute justify-start text-stone-300 text-2xl font-semibold font-['Prompt']">ค้นหา.....</div>
            <div className="w-[1920px] h-[744px] left-0 top-[1031px] absolute bg-amber-50" />
            <div className="w-[1600px] h-0 left-[1760px] top-[1212px] absolute origin-top-left -rotate-180 outline outline-[5px] outline-offset-[-2.50px] outline-green-800"></div>
            <div className="left-[761px] top-[1064px] absolute text-center justify-start text-green-800 text-7xl font-semibold font-['Prompt'] [text-shadow:_0px_4px_20px_rgb(0_0_0_/_0.25)]">สินค้าแนะนำ</div>
            <div className="w-[1720px] h-96 left-[100px] top-[1277px] absolute overflow-hidden">
                <div className="w-80 h-96 left-[1519px] top-[1px] absolute">
                <div className="w-80 h-96 left-0 top-0 absolute">
                    <div className="w-80 h-96 left-0 top-0 absolute bg-amber-50 rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-72 h-72 left-[20.79px] top-[20.79px] absolute bg-white rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)] outline outline-2 outline-offset-[-1.88px] outline-green-800" />
                    <div className="w-72 h-6 left-[21.58px] top-[334.02px] absolute bg-green-800" />
                </div>
                <div data-size="48" className="w-6 h-6 left-[286.84px] top-[373.30px] absolute outline outline-1 outline-offset-[-0.94px] overflow-hidden">
                    <div className="w-5 h-5 left-[1.59px] top-[3.22px] absolute outline outline-4 outline-offset-[-1.88px] outline-green-800" />
                </div>
                <div className="left-[20.79px] top-[369.14px] absolute justify-start text-green-800 text-2xl font-semibold font-['Prompt']">มีจำนวน xx ชิ้น</div>
                </div>
                <div className="w-80 h-96 left-[1146px] top-0 absolute">
                <div className="w-80 h-96 left-0 top-0 absolute">
                    <div className="w-80 h-96 left-0 top-0 absolute bg-amber-50 rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-72 h-72 left-[20.79px] top-[20.79px] absolute bg-white rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)] outline outline-2 outline-offset-[-1.88px] outline-green-800" />
                    <div className="w-72 h-6 left-[21.58px] top-[334.02px] absolute bg-green-800" />
                </div>
                <div data-size="48" className="w-6 h-6 left-[286.84px] top-[373.30px] absolute outline outline-1 outline-offset-[-0.94px] overflow-hidden">
                    <div className="w-5 h-5 left-[1.59px] top-[3.22px] absolute outline outline-4 outline-offset-[-1.88px] outline-green-800" />
                </div>
                <div className="left-[20.79px] top-[369.14px] absolute justify-start text-green-800 text-2xl font-semibold font-['Prompt']">มีจำนวน xx ชิ้น</div>
                </div>
                <div className="w-80 h-96 left-[773px] top-[1px] absolute">
                <div className="w-80 h-96 left-0 top-0 absolute">
                    <div className="w-80 h-96 left-0 top-0 absolute bg-amber-50 rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-72 h-72 left-[20.79px] top-[20.79px] absolute bg-white rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)] outline outline-2 outline-offset-[-1.88px] outline-green-800" />
                    <div className="w-72 h-6 left-[21.58px] top-[334.02px] absolute bg-green-800" />
                </div>
                <div data-size="48" className="w-6 h-6 left-[286.84px] top-[373.30px] absolute outline outline-1 outline-offset-[-0.94px] overflow-hidden">
                    <div className="w-5 h-5 left-[1.59px] top-[3.22px] absolute outline outline-4 outline-offset-[-1.88px] outline-green-800" />
                </div>
                <div className="left-[20.79px] top-[369.14px] absolute justify-start text-green-800 text-2xl font-semibold font-['Prompt']">มีจำนวน xx ชิ้น</div>
                </div>
                <div className="w-80 h-96 left-[400px] top-0 absolute">
                <div className="w-80 h-96 left-0 top-0 absolute">
                    <div className="w-80 h-96 left-0 top-0 absolute bg-amber-50 rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-72 h-72 left-[20.79px] top-[20.79px] absolute bg-white rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)] outline outline-2 outline-offset-[-1.88px] outline-green-800" />
                    <div className="w-72 h-6 left-[21.58px] top-[334.02px] absolute bg-green-800" />
                </div>
                <div data-size="48" className="w-6 h-6 left-[286.84px] top-[373.30px] absolute outline outline-1 outline-offset-[-0.94px] overflow-hidden">
                    <div className="w-5 h-5 left-[1.59px] top-[3.22px] absolute outline outline-4 outline-offset-[-1.88px] outline-green-800" />
                </div>
                <div className="left-[20.79px] top-[369.14px] absolute justify-start text-green-800 text-2xl font-semibold font-['Prompt']">มีจำนวน xx ชิ้น</div>
                </div>
                <div className="w-80 h-96 left-[30px] top-[1px] absolute">
                <div className="w-80 h-96 left-0 top-0 absolute">
                    <div className="w-80 h-96 left-0 top-0 absolute bg-amber-50 rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-72 h-72 left-[20.79px] top-[20.79px] absolute bg-white rounded-2xl shadow-[0px_3.7535312175750732px_18.767656326293945px_0px_rgba(0,0,0,0.25)] outline outline-2 outline-offset-[-1.88px] outline-green-800" />
                    <div className="w-72 h-6 left-[21.58px] top-[334.02px] absolute bg-green-800" />
                </div>
                <div data-size="48" className="w-6 h-6 left-[286.84px] top-[373.30px] absolute outline outline-1 outline-offset-[-0.94px] overflow-hidden">
                    <div className="w-5 h-5 left-[1.59px] top-[3.22px] absolute outline outline-4 outline-offset-[-1.88px] outline-green-800" />
                </div>
                <div className="left-[20.79px] top-[369.14px] absolute justify-start text-green-800 text-2xl font-semibold font-['Prompt']">มีจำนวน xx ชิ้น</div>
                </div>
                <img className="w-56 h-80 left-[87px] top-[-8px] absolute" src="https://placehold.co/218x305" />
                <img className="w-44 h-64 left-[472px] top-[37px] absolute" src="https://placehold.co/182x263" />
                <img className="w-64 h-44 left-[800px] top-[91px] absolute" src="https://placehold.co/265x176" />
                <img className="w-32 h-64 left-[1251px] top-[35px] absolute" src="https://placehold.co/126x270" />
                <img className="w-36 h-60 left-[1610px] top-[48px] absolute" src="https://placehold.co/152x234" />
            </div>
            <div data-property-1="Default" className="w-20 h-20 left-[1789px] top-[1456px] absolute">
                <div className="w-20 h-20 left-0 top-0 absolute bg-amber-50 rounded-full shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)]" />
                <div className="w-9 h-px left-[22px] top-[40px] absolute border-[5px] border-green-800" />
            </div>
            <div data-property-1="Default" className="w-20 h-20 left-[131px] top-[1539px] absolute origin-top-left -rotate-180">
                <div className="w-20 h-20 left-0 top-0 absolute bg-amber-50 rounded-full shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)]" />
                <div className="w-9 h-px left-[22px] top-[40px] absolute border-[5px] border-green-800" />
            </div>
            <div className="w-[1920px] h-[524px] left-0 top-[2784px] absolute">
                <div className="w-[1920px] h-[524px] left-0 top-0 absolute bg-amber-50" />
                <img className="w-48 h-48 left-[100px] top-0 absolute" src="https://placehold.co/198x198" />
                <div className="left-[125px] top-[186px] absolute justify-start text-green-800 text-5xl font-semibold font-['Prompt']">ธีรยุทธการเกษตร</div>
                <div className="w-[1003px] left-[125px] top-[262px] absolute justify-start text-green-800 text-3xl font-semibold font-['Prompt']">บริการจัดส่งสินค้าเกษตรถึงหน้าบ้านคุณ ด้วยระบบขนส่งที่ได้มาตรฐาน มั่นใจได้ว่าสินค้าจะถึงมืออย่างปลอดภัยและทันเวลาฤดูกาลเพาะปลูก</div>
                <div className="left-[1324px] top-[23px] absolute text-center justify-start text-green-800 text-4xl font-semibold font-['Prompt']">หน้าเว็บ</div>
                <div className="left-[1327px] top-[111px] absolute justify-start text-green-800 text-4xl font-semibold font-['Prompt']">หน้าหลัก</div>
                <div className="left-[1349px] top-[178px] absolute text-center justify-start text-green-800 text-4xl font-semibold font-['Prompt']">เมล็ด</div>
                <div className="left-[1328px] top-[245px] absolute text-center justify-start text-green-800 text-4xl font-semibold font-['Prompt']">อุปกรณ์</div>
                <div className="left-[1366px] top-[312px] absolute text-center justify-start text-green-800 text-4xl font-semibold font-['Prompt']">ปุ๋ย</div>
                <div className="left-[1355px] top-[379px] absolute text-center justify-start text-green-800 text-4xl font-semibold font-['Prompt']">อื่นๆ</div>
                <div className="w-56 h-0 left-[1278px] top-[93px] absolute outline outline-[5px] outline-offset-[-2.50px] outline-green-800"></div>
                <div className="left-[1654px] top-[23px] absolute text-center justify-start text-green-800 text-4xl font-semibold font-['Prompt']">บริการ</div>
                <div className="left-[1650px] top-[111px] absolute text-center justify-start text-green-800 text-4xl font-semibold font-['Prompt']">หน้าผู้ใช้</div>
                <div className="left-[1660px] top-[178px] absolute text-center justify-start text-green-800 text-4xl font-semibold font-['Prompt']">รถเข็น</div>
                <div className="w-56 h-0 left-[1599px] top-[93px] absolute outline outline-[5px] outline-offset-[-2.50px] outline-green-800"></div>
                <div className="w-[1920px] h-9 left-0 top-[486px] absolute bg-amber-50 outline outline-[3px] outline-green-800" />
                <div className="left-[717px] top-[490px] absolute text-center justify-start text-green-800 text-xl font-semibold font-['Prompt']">© 2026 TEERAYUTKANKASED. All rights reserved.</div>
            </div>
            <div className="w-[1920px] h-28 left-0 top-0 absolute shadow-[0px_1px_10px_0px_rgba(0,0,0,0.20)]">
                <div className="w-[1920px] h-28 left-0 top-0 absolute bg-amber-50 outline outline-[3px] outline-green-800" />
                <div data-property-1="Default" className="w-10 h-11 left-[501px] top-[33px] absolute">
                <div className="left-0 top-0 absolute text-center justify-start text-green-800 text-3xl font-semibold font-['Prompt']">ปุ๋ย</div>
                </div>
                <div data-property-1="Default" className="w-24 h-11 left-[580px] top-[33px] absolute">
                <div className="left-0 top-0 absolute text-center justify-start text-green-800 text-3xl font-semibold font-['Prompt']">อุปกรณ์</div>
                </div>
                <div data-property-1="Default" className="w-16 h-11 left-[724px] top-[33px] absolute">
                <div className="left-0 top-0 absolute text-center justify-start text-green-800 text-3xl font-semibold font-['Prompt']">เมล็ด</div>
                </div>
                <div data-property-1="Default" className="w-24 h-11 left-[832px] top-[33px] absolute">
                <div className="left-0 top-0 absolute text-center justify-start text-green-800 text-3xl font-semibold font-['Prompt']">สารเคมี</div>
                </div>
                <div data-property-1="Default" className="w-14 h-11 left-[968px] top-[33px] absolute">
                <div className="left-0 top-0 absolute text-center justify-start text-green-800 text-3xl font-semibold font-['Prompt']">อื่นๆ</div>
                </div>
                <div className="w-20 h-0 left-[472px] top-[18px] absolute origin-top-left rotate-90 outline outline-[5px] outline-offset-[-2.50px] outline-green-800"></div>
                <div className="w-96 h-28 left-[100px] top-0 absolute">
                <img className="w-32 h-28 left-0 top-0 absolute" src="https://placehold.co/128x110" />
                <div className="left-[128px] top-[32px] absolute justify-start text-green-800 text-3xl font-semibold font-['Prompt']">ธีรยุทธการเกษตร</div>
                </div>
                <div className="w-44 h-16 left-[1567px] top-[21px] absolute">
                <div className="w-14 h-14 left-[115.38px] top-[6.38px] absolute bg-green-800" />
                <div className="left-0 top-[18px] absolute text-right justify-start text-green-800 text-2xl font-semibold font-['Prompt']">เข้าสู่ระบบ</div>
                </div>
                <div className="w-14 h-14 left-[1762px] top-[27px] absolute overflow-hidden">
                <div className="w-14 h-12 left-[2.42px] top-[2.42px] absolute outline outline-4 outline-offset-[-2px] outline-Color" />
                </div>
            </div>
            </div> 
    );
};
export default Home ;