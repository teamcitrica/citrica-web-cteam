"use client";
import { Container } from 'citrica-ui-toolkit';
import ForgotPassword from '@/shared/components/citrica-ui/organism/forgot-password';
import { use } from 'react';

const ForgotPasswordPage = () => {

	return (
		<Container className='container-background w-full h-screen flex justify-center items-center'>
			<div className="light-top-right"></div>
			<div className="ellipse2-top"></div>
			<img src="/img/line-top.svg" alt="" className="line-top" />
			<ForgotPassword />
			<div className="light-bottom-left"></div>
			<div className="ellipse2-bottom"></div>
			<img src="/img/line-bottom.svg" alt="" className="line-bottom" />
		</Container>
	)
}

export default ForgotPasswordPage
