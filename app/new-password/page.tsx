"use client";

import { Suspense } from 'react';
import { Container } from '@/styles/07-objects/objects';
import NewPassword from '@/shared/components/citrica-ui/organism/new-password';

// Forzar renderizado dinámico (no prerenderizar)
export const dynamic = 'force-dynamic';

const NewPasswordPage = () => {

	return (
		<Container className='flex justify-center items-center h-screen'>
			<Suspense fallback={<div>Cargando...</div>}>
				<NewPassword />
			</Suspense>
		</Container>
	)
}

export default NewPasswordPage
