// import errorSvg from '../assets/not-found-error-alert-svgrepo-com.svg'
const ErrorPage = () => {
    return ( 
        <>

            <section style={{display: 'flex', flexDirection: 'column', position: 'fixed', top: '0', zIndex: '1000', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'blueviolet'}}>

                
                <h1>TIM</h1>

                <br />
                <br />
                <br />

                <h1>404 Error</h1>
                
                <h5>[Page Does Not Exist]</h5>

            </section>
        </>
     );
}
 
export default ErrorPage;