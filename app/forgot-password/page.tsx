import { Container } from '@/styles/07-objects/objects';
import ForgotPassword from '@/shared/components/citrica-ui/organism/forgot-password';

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
