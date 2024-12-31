/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
//package javamysqlconnect;

import java.security.Key;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
//import java.security.Provider;
import java.security.SecureRandom;
import java.security.Security;
//import java.sql.SQLException;
import javax.crypto.Cipher;
//import static org.bouncycastle.asn1.x509.ObjectDigestInfo.publicKey;
//import org.bouncycastle.jce.provider.BouncyCastleProvider;
//import org.bouncycastle.jce.provider.BouncyCastleProvider;
/**
 *
 * @author HP
 */
public class ElGamalCrypto {
    //public MainClass {
    //static void testMain(){
   public static void main(String[] args) throws Exception {
      //public static void main(String[] args) {
        
           
    Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());
    
    byte[] input ="ElGamal FHE Secret Message".getBytes();
Cipher cipher = Cipher.getInstance("ElGamal/None/NoPadding", "BC");
KeyPairGenerator generator = KeyPairGenerator.getInstance("ElGamal", "BC");
SecureRandom random = new SecureRandom();

generator.initialize(1028, random);//128 original too small but changed to 1028...

KeyPair pair = generator.generateKeyPair();
Key pubKey = pair.getPublic();
Key privKey = pair.getPrivate();

cipher.init(Cipher.ENCRYPT_MODE, pubKey, random);
byte [] cipherText = cipher.doFinal(input);

System.out.println("cipher - ElGamal: " + new String(cipherText));
System.out.println();
System.out.println("public key - ElGamal: " + pubKey);
System.out.println("private key - ElGamal: " + privKey);
System.out.println();

cipher.init(Cipher.DECRYPT_MODE, privKey);
byte[] plainText = cipher.doFinal(cipherText);
System.out.println("Recovered plaintext : " + new String(plainText));
        
}

    //static class main {

      //  public main(String[] args) {
            
       // }
    //}
}
