const XboxLiveAuth = require('@xboxreplay/xboxlive-auth')
const fetch = require('node-fetch')
const fs = require('fs')

const XSTSRelyingParty = 'rp://api.minecraftservices.com'
const MCSLogWithXbox = 'https://api.minecraftservices.com/authentication/login_with_xbox'
const MCSEntitlement = 'https://api.minecraftservices.com/entitlements/mcstore'
const MCSProfile = 'https://api.minecraftservices.com/minecraft/profile'

const getFetchOptions = {
    headers: {
        'Content-Type': 'application/json',
        'User-agent': 'thunder-mc'
    }
}


module.exports = async ( req, res ) => {
    const options = req.body
    const XAuthResponse = await XboxLiveAuth.authenticate(username, password, {XSTSRelyingParty})
        .catch((err) => {
            if (err.details) throw new Error(`Unable to authenticate with Xbox Live: ${JSON.stringify(err.details)}`)
            else throw Error(err)
        })

    const MineServicesResponse = await fetch(MCSLogWithXbox, {
        method: 'post',
        ...getFetchOptions,
        body: JSON.stringify({ identityToken: `XBL3.0 x=${XAuthResponse.userHash};${XAuthResponse.XSTSToken}` })
    }).then(checkStatus)

    options.haveCredentials = MineServicesResponse.access_token != null

    getFetchOptions.headers.Authorization = `Bearer ${MineServicesResponse.access_token}`
    const MineEntitlements = await fetch(MCSEntitlement, getFetchOptions).then(checkStatus)
    if (MineEntitlements.items.length === 0) throw Error('This user does not have any items on its accounts according to the api.')

    const MinecraftProfile = await fetch(MCSProfile, getFetchOptions).then(checkStatus)
    if (!MinecraftProfile.id) throw Error('This user does not own Minecraft.')


    const profile = {
        name: MinecraftProfile.name,
        id: MinecraftProfile.id,
        accessToken: MineServicesResponse.access_token,
        selectedProfile: profile,
        availableProfile: [profile]
    }

    options.accessToken = MineServicesResponse.access_token


    await fs.writeFile(`${MinecraftProfile.name}.json`, JSON.stringify(profile), function (error) {
        if (error) {
            console.log('Error')
        }
    })

    return res.status(200).json({ status: 200, data: profile });
}



function checkStatus (res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res.json()
    } else {
        throw Error(res.statusText)
    }
}


