import { Link } from "react-router-dom";

import logo from "../assets/images/logo.png";

function Navbar() {
	return (
		<div className="sticky w-full h-25 top-0 z-50 bg-[#FFFEF2] flex items-center justify-between px-30">
			<nav className="flex gap-3 items-center">
				<Link to="/"
				className="text-[#256D45] text-xl"
				>
					<img
						src={logo}
						alt="ธีรยุทธการเกษตร Logo"
						className="w-20 h-20"
					/>
				</Link>

				<Link
					to="/fertilizers"
					className="text-[#256D45] text-xl"
				>
					ปุ๋ย
				</Link>

				<Link
					to="/tools"
					className="text-[#256D45] text-xl"
				>
					อุปกรณ์
				</Link>

				<Link
					to="/seeds"
					className="text-[#256D45] text-xl"
				>
					เมล็ด
				</Link>
				
				<Link
					to="/others"
					className="text-[#256D45] text-xl"
				>
					อื่นๆ
				</Link>
			</nav>
		</div>
		
	);
}

export default Navbar;