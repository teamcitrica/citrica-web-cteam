"use client";
import { Suspense } from 'react';
import { Container } from 'citrica-ui-toolkit';
import NewPassword from '@/shared/components/citrica-ui/organism/new-password';

// Forzar renderizado dinámico (no prerenderizar)
export const dynamic = 'force-dynamic';

const NewPasswordPage = () => {

	return (
		<Container className='container-background w-full h-screen flex justify-center items-center'>
			<div className="light-top-right"></div>
			<div className="ellipse2-top"></div>
			<img src="/img/line-top.svg" alt="" className="line-top" />
			<Suspense fallback={<div>Cargando...</div>}>
				<NewPassword />
			</Suspense>
			<div className="light-bottom-left"></div>
			<div className="ellipse2-bottom"></div>
			<img src="/img/line-bottom.svg" alt="" className="line-bottom" />
		</Container>
	)
}

export default NewPasswordPage
