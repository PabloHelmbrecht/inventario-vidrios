function eliminateLicenseKey():void {
    setTimeout(() => {
        const divs = document.getElementsByTagName('div')
        let licenseDiv
        for (let i = 0; i < divs.length; i++) {
            if (divs[i]?.innerText === 'MUI X Missing license key') {
                licenseDiv = divs[i]
            }
        }

        licenseDiv?.remove()
    }, 100)
}

export default eliminateLicenseKey